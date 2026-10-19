import { createHash } from "node:crypto";
import db from "@adonisjs/lucid/services/db";
import type { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import User from "#models/user";
import { ForestRoomsError } from "./forest_rooms_errors.js";
import {
    ReservationLockSetChanged,
    assertReservationOffice,
    withExistingReservation,
} from "./reservation_transactions.js";
import { roomReservationService } from "./room_reservation_service.js";

const RECEIPT_LIFETIME_MS = 24 * 60 * 60 * 1000;
type BridgeMetadata = { contractVersion: 1; officeId: number; serverNow: number };
const metadata = (officeId: number): BridgeMetadata => ({
    contractVersion: 1,
    officeId,
    serverNow: Date.now(),
});
type CommandIdentity = { requestId: string; requestCreatedAt: number };
type Human = CommandIdentity & { actorEmail: string };
type Allocation = { officeRoomId: number; start: number; end: number; title: string | null };
type Expected = { bookingId: number; expectedVersion: number };
export type EndInput = CommandIdentity & Expected & { officeRoomId: number };
export type ForestRoomCommand =
    | { operation: "create"; input: Human & Allocation }
    | { operation: "update"; input: Human & Allocation & Expected }
    | { operation: "cancel"; input: Human & Expected }
    | { operation: "end"; input: EndInput };
export interface BridgeBooking {
    id: string;
    officeRoomId: number;
    start: number;
    end: number;
    title: string | null;
    ownerUserId: string;
    ownerDisplayName: string;
    version: number;
    allocationAt: number;
    isOwn: boolean;
    canEdit: boolean;
}
type BookingChange = { before: BridgeBooking; after: BridgeBooking; appliedAt: number };
export type CommandResult = BridgeMetadata & {
    requestId: string;
    operation: ForestRoomCommand["operation"];
    booking?: BridgeBooking;
    cancelledId?: string;
    change?: BookingChange;
};
function bookingDto(row: RoomReservation, actor?: User): BridgeBooking {
    return {
        id: String(row.id),
        officeRoomId: row.officeRoomId,
        start: row.start.toMillis(),
        end: row.end.toMillis(),
        title: row.title,
        ownerUserId: String(row.userId),
        ownerDisplayName: row.user?.username ?? "Anonyme",
        version: row.integrationVersion,
        allocationAt: row.allocationAt.toMillis(),
        isOwn: Boolean(actor && actor.id === row.userId),
        canEdit: Boolean(actor && (actor.id === row.userId || actor.hasRights(["EVENT_ADMIN"]))),
    };
}
function isStoredObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function storedObject(value: unknown): Record<string, unknown> {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
    if (!isStoredObject(parsed)) throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
    return parsed;
}
function isStoredBooking(value: unknown): value is BridgeBooking {
    if (!isStoredObject(value)) return false;
    const identifier = (v: unknown) => typeof v === "string" && /^[1-9]\d{0,9}$/.test(v);
    const number = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
    return (
        identifier(value.id) &&
        identifier(value.ownerUserId) &&
        number(value.officeRoomId) &&
        number(value.start) &&
        number(value.end) &&
        typeof value.start === "number" &&
        typeof value.end === "number" &&
        value.start < value.end &&
        number(value.version) &&
        number(value.allocationAt) &&
        (value.title === null || typeof value.title === "string") &&
        typeof value.ownerDisplayName === "string" &&
        typeof value.isOwn === "boolean" &&
        typeof value.canEdit === "boolean"
    );
}
function storedResult(value: unknown, officeId: number): CommandResult {
    const result = storedObject(value);
    if (result.officeId !== officeId) throw new ForestRoomsError("NOT_FOUND", 404);
    const operation = result.operation;
    if (
        result.contractVersion !== 1 ||
        typeof result.serverNow !== "number" ||
        !Number.isSafeInteger(result.serverNow) ||
        typeof result.requestId !== "string" ||
        (operation !== "create" &&
            operation !== "update" &&
            operation !== "cancel" &&
            operation !== "end")
    )
        throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
    const output: CommandResult = {
        contractVersion: 1,
        officeId,
        serverNow: result.serverNow,
        requestId: result.requestId,
        operation,
    };
    if (result.booking !== undefined) {
        if (!isStoredBooking(result.booking))
            throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
        output.booking = result.booking;
    }
    if (result.cancelledId !== undefined) {
        if (typeof result.cancelledId !== "string")
            throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
        output.cancelledId = result.cancelledId;
    }
    if (result.change !== undefined) {
        const change = result.change;
        if (
            !isStoredObject(change) ||
            !isStoredBooking(change.before) ||
            !isStoredBooking(change.after) ||
            typeof change.appliedAt !== "number" ||
            !Number.isSafeInteger(change.appliedAt)
        )
            throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
        output.change = { before: change.before, after: change.after, appliedAt: change.appliedAt };
    }
    if (
        (operation === "cancel" && !output.cancelledId) ||
        (operation !== "cancel" && !output.booking) ||
        (operation === "end" && !output.change)
    )
        throw new ForestRoomsError("INVALID_STORED_RESULT", 503);
    return output;
}
export async function resolveForestActor(email: string, trx?: TransactionClientContract) {
    const query = User.query(trx ? { client: trx } : {})
        .select("id", "username", "email", "rights")
        .whereRaw("LOWER(TRIM(email)) = ?", [email.trim().toLowerCase()])
        .limit(2);
    if (trx) query.forShare();
    const matches = await query;
    if (matches.length !== 1) throw new ForestRoomsError("ACTOR_UNRESOLVED", 403);
    return matches[0];
}
function officeBookingQuery(officeId: number) {
    return RoomReservation.query()
        .whereHas("room", (room) =>
            room.whereHas("officeFloor", (floor) => floor.where("officeId", officeId)),
        )
        .preload("user", (user) => user.select("id", "username"));
}
function commandHash(officeId: number, command: ForestRoomCommand) {
    return createHash("sha256")
        .update(JSON.stringify({ officeId, ...command }))
        .digest("hex");
}
class ForestRoomsService {
    async catalog(
        officeId: number,
        email: string | undefined,
        afterId = 0,
        limit = 100,
        includeAllocationStatus = false,
    ) {
        if (email !== undefined) await resolveForestActor(email);
        const rows = await OfficeRoom.query()
            .whereHas("officeFloor", (q) => q.where("officeId", officeId))
            .where("id", ">", afterId)
            .orderBy("id")
            .limit(limit + 1)
            .preload("officeFloor");
        const page = rows.slice(0, limit);
        const allocated = new Set<number>();
        if (includeAllocationStatus && page.length) {
            const allocations = await RoomReservation.query()
                .select("officeRoomId")
                .distinct("officeRoomId")
                .whereIn(
                    "officeRoomId",
                    page.map((room) => room.id),
                )
                .where("end", ">", new Date());
            for (const allocation of allocations) allocated.add(allocation.officeRoomId);
        }
        return {
            ...metadata(officeId),
            rooms: page.map((room) => ({
                id: room.id,
                name: room.name,
                floor: room.officeFloor.floor,
                isBookable: Boolean(room.isBookable),
                isPhonebox: Boolean(room.isPhonebox),
                ...(includeAllocationStatus
                    ? { hasCurrentOrFutureAllocation: allocated.has(room.id) }
                    : {}),
            })),
            nextAfterId: rows.length > limit ? page[page.length - 1].id : null,
        };
    }

    async planning(officeId: number, email: string | undefined, date: string) {
        const actor = email === undefined ? undefined : await resolveForestActor(email);
        const from = DateTime.fromISO(date, { zone: "Europe/Paris" }).startOf("day");
        if (!from.isValid || from.toISODate() !== date)
            throw new ForestRoomsError("INVALID_DATE", 400);
        const to = from.plus({ days: 1 });
        const rows = await officeBookingQuery(officeId)
            .where("end", ">", from.toUTC().toJSDate())
            .where("start", "<", to.toUTC().toJSDate())
            .orderBy("id")
            .limit(10001);
        if (rows.length > 10000) throw new ForestRoomsError("DAY_LIMIT_EXCEEDED", 503);
        return {
            ...metadata(officeId),
            day: { date, from: from.toMillis(), to: to.toMillis() },
            actor: actor
                ? {
                      id: String(actor.id),
                      displayName: actor.username,
                      canManageAll: actor.hasRights(["EVENT_ADMIN"]),
                  }
                : null,
            bookings: rows.map((row) => bookingDto(row, actor)),
        };
    }

    async detail(officeId: number, email: string | undefined, id: number) {
        const actor = email === undefined ? undefined : await resolveForestActor(email);
        const booking = await officeBookingQuery(officeId).where("id", id).firstOrFail();
        return { ...metadata(officeId), booking: bookingDto(booking, actor) };
    }

    async receipt(
        principalId: number,
        officeId: number,
        requestId: string,
        expected?: ForestRoomCommand,
    ) {
        const row = await db
            .from("forest_room_requests")
            .where("principal_id", principalId)
            .where("request_id", requestId)
            .where("created_at", ">", new Date(Date.now() - RECEIPT_LIFETIME_MS))
            .first();
        if (!row) throw new ForestRoomsError("NOT_FOUND", 404);
        if (expected && row.payload_hash !== commandHash(officeId, expected))
            throw new ForestRoomsError("REQUEST_CONFLICT", 409);
        return storedResult(row.result, officeId);
    }

    async command(principalId: number, officeId: number, command: ForestRoomCommand) {
        const { input, operation } = command;
        // Validated objects have deterministic key ordering and include actor, office and operation.
        const payloadHash = commandHash(officeId, command);
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                return await db.transaction(async (trx) => {
                    const now = Date.now();
                    await trx.rawQuery(
                        `INSERT INTO forest_room_requests
                        (principal_id, request_id, operation, payload_hash, result, issued_at, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE request_id = request_id`,
                        [
                            principalId,
                            input.requestId,
                            operation,
                            payloadHash,
                            JSON.stringify({ officeId, pending: true }),
                            new Date(input.requestCreatedAt),
                            new Date(now),
                        ],
                    );
                    const receipt = await trx
                        .from("forest_room_requests")
                        .where("principal_id", principalId)
                        .where("request_id", input.requestId)
                        .forUpdate()
                        .first();
                    if (receipt.payload_hash !== payloadHash)
                        throw new ForestRoomsError("REQUEST_CONFLICT", 409);
                    if (now - new Date(receipt.created_at).getTime() >= RECEIPT_LIFETIME_MS)
                        throw new ForestRoomsError("REQUEST_EXPIRED", 409);
                    const stored = storedObject(receipt.result);
                    if (stored.pending !== true)
                        return { result: storedResult(stored, officeId), event: null };
                    if (
                        input.requestCreatedAt < now - 300000 ||
                        input.requestCreatedAt > now + 30000
                    )
                        throw new ForestRoomsError("REQUEST_EXPIRED", 409);
                    let booking: RoomReservation | undefined;
                    let change: BookingChange | undefined;
                    let cancelledId: string | undefined;
                    let actor: User | undefined;
                    if (command.operation === "end") {
                        const ended = await this.end(officeId, command.input, trx);
                        booking = ended.booking;
                        change = ended.change;
                    } else {
                        actor = await resolveForestActor(command.input.actorEmail, trx);
                        const context = {
                            transaction: trx,
                            officeId,
                            maxChangedTitleLength: 160,
                            expectedVersion:
                                command.operation === "create"
                                    ? undefined
                                    : command.input.expectedVersion,
                        };
                        if (command.operation === "cancel") {
                            cancelledId = String(
                                await roomReservationService.delete(
                                    actor,
                                    command.input.bookingId,
                                    context,
                                ),
                            );
                        } else {
                            const allocation = {
                                officeRoomId: command.input.officeRoomId,
                                title: command.input.title,
                                start: new Date(command.input.start),
                                end: new Date(command.input.end),
                            };
                            booking =
                                command.operation === "create"
                                    ? await roomReservationService.create(
                                          actor,
                                          allocation,
                                          context,
                                      )
                                    : await roomReservationService.update(
                                          actor,
                                          command.input.bookingId,
                                          allocation,
                                          context,
                                      );
                        }
                    }
                    const result: CommandResult = {
                        ...metadata(officeId),
                        requestId: input.requestId,
                        operation,
                        ...(booking ? { booking: bookingDto(booking, actor) } : {}),
                        ...(cancelledId ? { cancelledId } : {}),
                        ...(change ? { change } : {}),
                    };
                    await trx
                        .from("forest_room_requests")
                        .where("principal_id", principalId)
                        .where("request_id", input.requestId)
                        .update({ result: JSON.stringify(result) });
                    return { result, event: { booking, cancelledId } };
                });
            } catch (error) {
                if (!(error instanceof ReservationLockSetChanged)) throw error;
            }
        }
        throw new ForestRoomsError("RESERVATION_CHANGED", 409);
    }

    private async end(officeId: number, input: EndInput, trx: TransactionClientContract) {
        return withExistingReservation(
            input.bookingId,
            null,
            async (lockedTrx, booking) => {
                const room = await assertReservationOffice(
                    booking.officeRoomId,
                    officeId,
                    lockedTrx,
                );
                if (
                    !room.isBookable ||
                    room.isPhonebox ||
                    booking.officeRoomId !== input.officeRoomId
                )
                    throw new ForestRoomsError("INVALID_ROOM", 404);
                if (booking.integrationVersion !== input.expectedVersion)
                    throw new ForestRoomsError("RESERVATION_CHANGED", 409);
                const now = Date.now();
                const effectiveEnd = Math.ceil(now / 1000) * 1000;
                const ongoing = booking.start.toMillis() <= now && now < booking.end.toMillis();
                if (
                    !ongoing ||
                    effectiveEnd <= booking.start.toMillis() ||
                    effectiveEnd >= booking.end.toMillis()
                )
                    throw new ForestRoomsError("RESERVATION_NOT_ONGOING", 409);
                await booking.load("user", (user) => user.select("id", "username"));
                const before = bookingDto(booking);
                booking.end = DateTime.fromMillis(effectiveEnd, { zone: "utc" });
                booking.integrationVersion++;
                await booking.save();
                return { booking, change: { before, after: bookingDto(booking), appliedAt: now } };
            },
            trx,
        );
    }

    async prune() {
        const receipts = await db
            .from("forest_room_requests")
            .where("created_at", "<=", new Date(Date.now() - RECEIPT_LIFETIME_MS))
            .delete();
        return { receipts };
    }
}
export const forestRoomsService = new ForestRoomsService();
