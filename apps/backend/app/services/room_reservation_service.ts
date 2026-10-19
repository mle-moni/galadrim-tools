import type { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";
import Office from "#models/office";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import type User from "#models/user";
import { reservationUserSelector } from "../controllers/room_reservations/reservation_user_selecter.js";
import { authorizeOwnedResourceMutation } from "./reservation_authorization.js";
import { ReservationServiceError } from "./reservation_errors.js";
import { withExistingReservation, withReservationRooms } from "./reservation_transactions.js";

const DEFAULT_TIMEZONE = "Europe/Paris";

type DateInput = Date | string;

export interface ReservationDateRangeInput {
    start: DateInput;
    end: DateInput;
    timezone?: string;
}

export interface CreateReservationInput extends ReservationDateRangeInput {
    title?: string | null;
    officeRoomId: number;
    userId?: number;
}

export interface UpdateReservationInput extends ReservationDateRangeInput {
    title: string | null;
    officeRoomId: number;
}

export interface SearchReservationsInput extends ReservationDateRangeInput {
    officeId?: number;
    officeRoomId?: number;
    userId?: number;
    limit?: number;
}

export interface AvailableRoomsInput extends ReservationDateRangeInput {
    officeId?: number | null;
    hasTv?: boolean;
}

class RoomReservationService {
    async listForOfficeDays(officeId: number, days: DateInput[], timezone = DEFAULT_TIMEZONE) {
        const office = await Office.query().where("id", officeId).preload("rooms").firstOrFail();
        const ranges = days.map((day) => this.parseDayRange(day, timezone));
        const roomIds = office.rooms.map((room) => room.id);

        if (roomIds.length === 0 || ranges.length === 0) {
            return [];
        }

        const reservationsQuery = RoomReservation.query().whereIn("officeRoomId", roomIds);
        reservationsQuery.where((query) => {
            for (const range of ranges) {
                query.orWhere((rangeQuery) =>
                    rangeQuery
                        .where("end", ">", range.start.toJSDate())
                        .andWhere("start", "<", range.end.toJSDate()),
                );
            }
        });

        return reservationsQuery.preload("user", reservationUserSelector);
    }

    async search(input: SearchReservationsInput) {
        const range = this.parseReservationRange(input);
        const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
        const reservationsQuery = RoomReservation.query()
            .where("end", ">", range.start.toJSDate())
            .andWhere("start", "<", range.end.toJSDate())
            .orderBy("start", "asc")
            .limit(limit)
            .preload("user", reservationUserSelector)
            .preload("room", (roomQuery) => roomQuery.preload("officeFloor"));

        if (input.officeRoomId !== undefined) {
            reservationsQuery.where("officeRoomId", input.officeRoomId);
        }

        if (input.userId !== undefined) {
            reservationsQuery.where("userId", input.userId);
        }

        if (input.officeId !== undefined) {
            reservationsQuery.whereHas("room", (roomQuery) =>
                roomQuery.whereHas("officeFloor", (floorQuery) =>
                    floorQuery.where("officeId", input.officeId!),
                ),
            );
        }

        return reservationsQuery;
    }

    async show(id: number) {
        return RoomReservation.query()
            .where("id", id)
            .preload("user", reservationUserSelector)
            .preload("room", (roomQuery) => roomQuery.preload("officeFloor"))
            .firstOrFail();
    }

    async availableRooms(input: AvailableRoomsInput) {
        const range = this.parseReservationRange(input);
        const allRoomsQuery = OfficeRoom.query()
            .select("id", "name", "officeFloorId", "hasTv")
            .where("is_bookable", true)
            .where("is_phonebox", false)
            .preload("officeFloor");

        if (input.officeId !== undefined && input.officeId !== null) {
            allRoomsQuery.whereHas("officeFloor", (builder) =>
                builder.where("office_id", input.officeId!),
            );
        }

        if (input.hasTv !== undefined) {
            allRoomsQuery.where("has_tv", input.hasTv);
        }

        const allRooms = await allRoomsQuery;
        const reservations = await RoomReservation.query()
            .where("end", ">", range.start.toJSDate())
            .andWhere("start", "<", range.end.toJSDate());
        const unavailableRoomIds = new Set(
            reservations.map((reservation) => reservation.officeRoomId),
        );

        return allRooms
            .filter((room) => !unavailableRoomIds.has(room.id))
            .map((room) => ({
                id: room.id,
                name: room.name,
                officeId: room.officeFloor.officeId,
                officeFloorId: room.officeFloorId,
                hasTv: room.hasTv,
            }));
    }

    async create(actor: User, input: CreateReservationInput) {
        const range = this.parseReservationRange(input);
        const userId = input.userId ?? actor.id;
        return withReservationRooms([input.officeRoomId], async (trx) => {
            if (userId !== actor.id && !actor.hasRights(["EVENT_ADMIN"])) {
                throw new ReservationServiceError(
                    "FORBIDDEN",
                    "Vous n'avez pas les droits nécessaires",
                    403,
                );
            }
            await this.assertRoomCanBeBooked(input.officeRoomId, trx);
            await this.assertRoomIsAvailable(input.officeRoomId, range.start, range.end, trx);
            const reservation = await RoomReservation.create(
                {
                    title: input.title ?? null,
                    start: range.start,
                    end: range.end,
                    officeRoomId: input.officeRoomId,
                    userId,
                    integrationVersion: 1,
                    allocationAt: this.allocationNow(),
                },
                { client: trx },
            );
            await reservation.load("user", reservationUserSelector);
            return reservation;
        });
    }

    async update(actor: User, id: number, input: UpdateReservationInput) {
        const range = this.parseReservationRange(input);
        return withExistingReservation(id, input.officeRoomId, async (trx, reservation) => {
            authorizeOwnedResourceMutation(actor, reservation, "EVENT_ADMIN");
            await this.assertRoomCanBeBooked(input.officeRoomId, trx);
            await this.assertRoomIsAvailable(
                input.officeRoomId,
                range.start,
                range.end,
                trx,
                reservation.id,
            );
            const reallocated =
                reservation.officeRoomId !== input.officeRoomId ||
                reservation.start.toMillis() !== range.start.toMillis();
            reservation.title = input.title;
            reservation.start = range.start;
            reservation.end = range.end;
            reservation.officeRoomId = input.officeRoomId;
            reservation.integrationVersion++;
            if (reallocated) reservation.allocationAt = this.allocationNow();
            await reservation.save();
            await reservation.load("user", reservationUserSelector);
            return reservation;
        });
    }

    async delete(actor: User, id: number) {
        return withExistingReservation(id, null, async (_trx, reservation) => {
            authorizeOwnedResourceMutation(actor, reservation, "EVENT_ADMIN");
            await reservation.delete();
            return id;
        });
    }

    // These bot-only paths share room locks but preserve phone-box eligibility.
    async reservePhoneBox(bot: User, officeRoomId: number) {
        return withReservationRooms([officeRoomId], async (trx) => {
            await OfficeRoom.query({ client: trx })
                .where("id", officeRoomId)
                .where("is_phonebox", true)
                .firstOrFail();
            const now = this.allocationNow();
            const last = await RoomReservation.query({ client: trx })
                .where("officeRoomId", officeRoomId)
                .where("userId", bot.id)
                .where("start", "<=", now.toJSDate())
                .where("end", ">", now.toJSDate())
                .orderBy("end", "desc")
                .forUpdate()
                .first();
            const end = now.plus({ hours: 2 });
            await this.assertRoomIsAvailable(officeRoomId, last?.start ?? now, end, trx, last?.id);
            let reservation = last;
            if (reservation) {
                reservation.end = end;
                reservation.integrationVersion++;
                await reservation.save();
            } else {
                reservation = await RoomReservation.create(
                    {
                        title: null,
                        officeRoomId,
                        userId: bot.id,
                        start: now,
                        end,
                        integrationVersion: 1,
                        allocationAt: now,
                    },
                    { client: trx },
                );
            }
            await reservation.load("user", reservationUserSelector);
            return { reservation, created: !last };
        });
    }

    async endPhoneBox(bot: User, officeRoomId: number) {
        return withReservationRooms([officeRoomId], async (trx) => {
            await OfficeRoom.query({ client: trx })
                .where("id", officeRoomId)
                .where("is_phonebox", true)
                .firstOrFail();
            const now = this.allocationNow();
            const last = await RoomReservation.query({ client: trx })
                .where("officeRoomId", officeRoomId)
                .where("userId", bot.id)
                .where("start", "<=", now.toJSDate())
                .where("end", ">", now.toJSDate())
                .orderBy("end", "desc")
                .forUpdate()
                .first();
            if (!last || last.start >= now) return null;
            last.end = now;
            last.integrationVersion++;
            await last.save();
            await last.load("user", reservationUserSelector);
            return last;
        });
    }

    private allocationNow() {
        // Existing Tools timestamps store whole seconds. Never move an anchor backwards.
        return DateTime.fromMillis(Math.ceil(Date.now() / 1000) * 1000, { zone: "utc" });
    }

    private parseReservationRange(input: ReservationDateRangeInput) {
        const timezone = input.timezone ?? DEFAULT_TIMEZONE;
        const start = this.parseDateTime(input.start, timezone);
        const end = this.parseDateTime(input.end, timezone);

        if (start >= end) {
            throw new ReservationServiceError(
                "INVALID_DATE_RANGE",
                "La date de début doit être avant la date de fin",
            );
        }

        const nextMidnight = start.setZone(timezone).startOf("day").plus({ days: 1 }).toUTC();
        if (end > nextMidnight) {
            throw new ReservationServiceError(
                "INVALID_DATE_RANGE",
                "La date de début et la date de fin doivent être sur la même journée",
            );
        }

        return { start, end };
    }

    private parseDayRange(day: DateInput, timezone: string) {
        const date = this.parseDateTime(day, timezone).setZone(timezone);
        const midnight = date.startOf("day");
        const start = midnight.toUTC();
        const end = midnight.plus({ days: 1 }).toUTC();

        return { start, end };
    }

    private parseDateTime(input: DateInput, timezone: string) {
        const dateTime =
            input instanceof Date
                ? DateTime.fromJSDate(input, { zone: "utc" }).setZone(timezone)
                : DateTime.fromISO(input, { setZone: true, zone: timezone }).setZone(timezone);

        if (!dateTime.isValid) {
            throw new ReservationServiceError("INVALID_DATE", "Invalid Date");
        }

        return dateTime.toUTC();
    }

    private async assertRoomCanBeBooked(officeRoomId: number, trx: TransactionClientContract) {
        const room = await OfficeRoom.query({ client: trx })
            .where("id", officeRoomId)
            .forUpdate()
            .first();

        if (!room) {
            throw new ReservationServiceError("INVALID_ROOM", "La salle n'existe pas", 404);
        }

        if (!room.isBookable) {
            throw new ReservationServiceError("NOT_BOOKABLE", `La salle n'est pas réservable`);
        }

        if (room.isPhonebox) {
            throw new ReservationServiceError(
                "PHONEBOX_NOT_BOOKABLE",
                "Les phone box ne sont pas réservables",
            );
        }
    }

    private async assertRoomIsAvailable(
        officeRoomId: number,
        start: DateTime,
        end: DateTime,
        trx: TransactionClientContract,
        excludedReservationId?: number,
    ) {
        const overlapQuery = RoomReservation.query({ client: trx })
            .where("officeRoomId", officeRoomId)
            .where("end", ">", start.toJSDate())
            .andWhere("start", "<", end.toJSDate());

        if (excludedReservationId !== undefined) {
            overlapQuery.whereNot("id", excludedReservationId);
        }

        const overlap = await overlapQuery.forUpdate().first();

        if (overlap) {
            throw new ReservationServiceError(
                "RESERVATION_OVERLAP",
                "La salle est déjà réservée sur ce créneau",
            );
        }
    }
}

export const roomReservationService = new RoomReservationService();
