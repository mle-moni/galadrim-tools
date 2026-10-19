import { randomUUID } from "node:crypto";
import db from "@adonisjs/lucid/services/db";
import { test } from "@japa/runner";
import Office from "#models/office";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";
import User from "#models/user";
import { roomReservationService } from "#services/room_reservation_service";

const prefix = `rooms-test-${randomUUID()}`;
let actor: User;
let office: Office;
let room: OfficeRoom;
let other: OfficeRoom;
let phone: OfficeRoom;
let outsider: User;
const start = "2030-01-15T10:00:00Z";
const end = "2030-01-15T11:00:00Z";

test.group("Shared reservation transactions", (group) => {
    group.setup(async () => {
        if (
            process.env.TOOLS_ROOMS_TEST !== "1" ||
            process.env.DB_DATABASE !== "tools_forest_rooms_test"
        ) {
            throw new Error("Isolated room fixture target required.");
        }
        const rows = await db.rawQuery("SELECT @@hostname AS host, DATABASE() AS db");
        if (rows[0][0].host !== "tools-forest-rooms-test-mysql") throw new Error("Wrong DB host");
        actor = await User.create({
            username: prefix,
            email: `${prefix}@example.test`,
            password: "synthetic-not-a-login",
            rights: 0,
        });
        outsider = await User.create({
            username: `${prefix}-other`,
            email: `${prefix}-other@example.test`,
            password: "synthetic-not-a-login",
            rights: 0,
        });
        office = await Office.create({ name: prefix, address: "Synthetic", lat: 0, lng: 0 });
        const floor = await OfficeFloor.create({ officeId: office.id, floor: 2, config: {} });
        room = await OfficeRoom.create({
            officeFloorId: floor.id,
            name: `${prefix}-A`,
            config: { points: [] },
            isBookable: true,
            isPhonebox: false,
        });
        other = await OfficeRoom.create({
            officeFloorId: floor.id,
            name: `${prefix}-B`,
            config: { points: [] },
            isBookable: true,
            isPhonebox: false,
        });
        phone = await OfficeRoom.create({
            officeFloorId: floor.id,
            name: `${prefix}-phone`,
            config: { points: [] },
            isBookable: false,
            isPhonebox: true,
        });
    });
    group.each.teardown(async () => {
        if (room && other)
            await db
                .from("room_reservations")
                .whereIn("office_room_id", [room.id, other.id, phone.id])
                .delete();
    });
    group.teardown(async () => {
        if (office) await office.delete();
        if (actor) await actor.delete();
        if (outsider) await outsider.delete();
    });
    test("parallel creators cannot double-book an initially empty room", async ({ assert }) => {
        const results = await Promise.allSettled([
            roomReservationService.create(actor, { officeRoomId: room.id, start, end }),
            roomReservationService.create(actor, { officeRoomId: room.id, start, end }),
        ]);
        assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
        const rows = await db.from("room_reservations").where("office_room_id", room.id);
        assert.lengthOf(rows, 1);
        assert.equal(rows[0].integration_version, 1);
        assert.isNotNull(rows[0].allocation_at);
    });
    test("adjacency is allowed; a rejected move leaves source and version unchanged", async ({
        assert,
    }) => {
        const first = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start,
            end,
        });
        await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start: end,
            end: "2030-01-15T12:00:00Z",
        });
        await roomReservationService.create(actor, { officeRoomId: other.id, start, end });
        await assert.rejects(async () => {
            await roomReservationService.update(actor, first.id, {
                officeRoomId: other.id,
                start,
                end,
                title: "Blocked",
            });
        }, /réservée/);
        const row = await db.from("room_reservations").where("id", first.id).first();
        assert.equal(row.office_room_id, room.id);
        assert.equal(row.integration_version, 1);
        assert.isNull(row.title);
    });
    test("title/end changes increment version without reallocating the booking", async ({
        assert,
    }) => {
        const first = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start,
            end,
        });
        const before = await db.from("room_reservations").where("id", first.id).first();
        await roomReservationService.update(actor, first.id, {
            officeRoomId: room.id,
            start,
            end: "2030-01-15T11:30:00Z",
            title: "Updated",
        });
        const after = await db.from("room_reservations").where("id", first.id).first();
        assert.equal(after.integration_version, 2);
        assert.equal(
            new Date(after.allocation_at).getTime(),
            new Date(before.allocation_at).getTime(),
        );
        assert.equal(after.title, "Updated");
    });
    test("a move resets an old allocation anchor and still increments its version", async ({
        assert,
    }) => {
        const first = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start,
            end,
        });
        await db
            .from("room_reservations")
            .where("id", first.id)
            .update({ allocation_at: "2000-01-01 00:00:00" });
        const before = Date.now();
        await roomReservationService.update(actor, first.id, {
            officeRoomId: other.id,
            start,
            end,
            title: null,
        });
        const row = await db.from("room_reservations").where("id", first.id).first();
        assert.equal(row.office_room_id, other.id);
        assert.equal(row.integration_version, 2);
        assert.isAtLeast(new Date(row.allocation_at).getTime(), before);
    });
    test("foreign owners are rejected inside the locked mutation", async ({ assert }) => {
        const first = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start,
            end,
        });
        await assert.rejects(async () => {
            await roomReservationService.update(outsider, first.id, {
                officeRoomId: other.id,
                start,
                end,
                title: "Forbidden",
            });
        }, /droits/);
        await assert.rejects(async () => {
            await roomReservationService.delete(outsider, first.id);
        }, /droits/);
        const row = await db.from("room_reservations").where("id", first.id).first();
        assert.equal(row.integration_version, 1);
        assert.equal(row.office_room_id, room.id);
    });
    test("phone-box sensor create/extend/end shares the room lock and versions", async ({
        assert,
    }) => {
        await assert.rejects(async () => {
            await roomReservationService.create(actor, { officeRoomId: phone.id, start, end });
        }, /réservable/);
        const results = await Promise.all([
            roomReservationService.reservePhoneBox(actor, phone.id),
            roomReservationService.reservePhoneBox(actor, phone.id),
        ]);
        assert.equal(results.filter((value) => value.created).length, 1);
        assert.equal(results[0].reservation.id, results[1].reservation.id);
        const rows = await db.from("room_reservations").where("office_room_id", phone.id);
        assert.lengthOf(rows, 1);
        assert.equal(rows[0].integration_version, 2);
        await db
            .from("room_reservations")
            .where("id", rows[0].id)
            .update({ start: new Date(Date.now() - 5000) });
        const closed = await roomReservationService.endPhoneBox(actor, phone.id);
        assert.isNotNull(closed);
        const row = await db.from("room_reservations").where("id", rows[0].id).first();
        assert.equal(row.integration_version, 3);
        assert.isBelow(new Date(row.end).getTime(), Date.now() + 1001);
        await assert.rejects(async () => {
            await roomReservationService.reservePhoneBox(actor, room.id);
        });
    });
    test("Paris spring/fall day reads use local next midnight and accept an exclusive midnight end", async ({
        assert,
    }) => {
        const spring = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start: "2026-03-29T21:30:00Z",
            end: "2026-03-29T22:00:00Z",
        });
        await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start: "2026-03-29T22:30:00Z",
            end: "2026-03-29T23:00:00Z",
        });
        const autumn = await roomReservationService.create(actor, {
            officeRoomId: room.id,
            start: "2026-10-25T22:30:00Z",
            end: "2026-10-25T23:00:00Z",
        });
        const springDay = await roomReservationService.listForOfficeDays(office.id, [
            "2026-03-29T12:00:00Z",
        ]);
        const autumnDay = await roomReservationService.listForOfficeDays(office.id, [
            "2026-10-25T12:00:00Z",
        ]);
        assert.deepEqual(
            springDay.map((value) => value.id),
            [spring.id],
        );
        assert.deepEqual(
            autumnDay.map((value) => value.id),
            [autumn.id],
        );
    });
    test("a future phone-box booking is not shortened or hidden by current sensor updates", async ({
        assert,
    }) => {
        const futureStart = new Date(Date.now() + 86400000);
        const futureEnd = new Date(Date.now() + 93600000);
        await db.table("room_reservations").insert({
            office_room_id: phone.id,
            user_id: actor.id,
            title: "Future bot fixture",
            start: futureStart,
            end: futureEnd,
        });
        const { reservation, created } = await roomReservationService.reservePhoneBox(
            actor,
            phone.id,
        );
        assert.isTrue(created);
        assert.isBelow(reservation.end.toMillis(), futureStart.getTime());
        await db
            .from("room_reservations")
            .where("id", reservation.id)
            .update({ start: new Date(Date.now() - 5000) });
        const closed = await roomReservationService.endPhoneBox(actor, phone.id);
        assert.equal(closed?.id, reservation.id);
        const future = await db
            .from("room_reservations")
            .where("office_room_id", phone.id)
            .where("title", "Future bot fixture")
            .first();
        assert.equal(future.integration_version, 1);
        assert.isAbove(new Date(future.end).getTime(), new Date(future.start).getTime());
    });
});
