import { randomUUID } from "node:crypto";
import db from "@adonisjs/lucid/services/db";
import { RIGHTS } from "@galadrim-tools/shared";
import { test } from "@japa/runner";
import Office from "#models/office";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";
import User from "#models/user";
import { Ws } from "#services/ws";

const prefix = `delegated-rooms-${randomUUID()}`;
let office: Office;
let room: OfficeRoom;
let owner: User;
let admin: User;
let ownerToken: string;
let adminToken: string;
const start = "2030-01-15T10:00:00.000Z";
const end = "2030-01-15T11:00:00.000Z";
const base = () => `/offices/${office.id}/reservations`;
const allocation = () => ({ officeRoomId: room.id, start, end });

async function tokenFor(user: User) {
    const token = await User.accessTokens.create(user, ["*"], { expiresIn: "10 minutes" });
    if (!token.value) throw new Error("Synthetic test token was not generated");
    return `Bearer ${token.value.release()}`;
}

test.group("Native delegated room reservations", (group) => {
    group.setup(async () => {
        // Refuse writes outside the existing disposable SQL fixture.
        if (
            process.env.NODE_ENV !== "test" ||
            process.env.DB_DATABASE !== "tools_forest_rooms_test"
        )
            throw new Error("Disposable room test database required");
        const [rows] = await db.rawQuery(
            "SELECT DATABASE() AS db, @@hostname AS host, CURRENT_USER() AS account",
        );
        if (
            rows[0].db !== "tools_forest_rooms_test" ||
            rows[0].host !== "tools-forest-rooms-test-mysql" ||
            !rows[0].account.startsWith("rooms_test@")
        )
            throw new Error("Room test database identity mismatch");
        const marker = await db.from("room_test_target").first();
        if (marker?.project !== "tools-forest-rooms-test")
            throw new Error("Room test database marker mismatch");
        owner = await User.create({
            username: `${prefix}-owner`,
            email: `${prefix}-owner@example.test`,
            password: "synthetic-not-a-login",
            rights: 0,
        });
        admin = await User.create({
            username: `${prefix}-admin`,
            email: `${prefix}-admin@example.test`,
            password: "synthetic-not-a-login",
            rights: RIGHTS.EVENT_ADMIN,
        });
        office = await Office.create({ name: prefix, address: "Synthetic", lat: 0, lng: 0 });
        const floor = await OfficeFloor.create({ officeId: office.id, floor: 2, config: {} });
        room = await OfficeRoom.create({
            name: prefix,
            officeFloorId: floor.id,
            config: { points: [] },
            isBookable: true,
            isPhonebox: false,
        });
        ownerToken = await tokenFor(owner);
        adminToken = await tokenFor(admin);
        Ws.boot();
    });
    group.each.teardown(async () => {
        if (room) await db.from("room_reservations").where("office_room_id", room.id).delete();
    });
    group.teardown(async () => {
        if (office) await office.delete();
        for (const user of [owner, admin]) {
            if (!user) continue;
            await db.from("auth_access_tokens").where("tokenable_id", user.id).delete();
            await user.delete();
        }
    });

    test("delegation still requires native authentication", async ({ client }) => {
        (await client.post(base()).json({ ...allocation(), userEmail: owner.email })).assertStatus(
            401,
        );
    });

    test("ordinary creation without userEmail still belongs to the caller", async ({
        client,
        assert,
    }) => {
        const response = await client
            .post(base())
            .header("Authorization", ownerToken)
            .json(allocation());
        response.assertStatus(200);
        const reservation = response.body().reservation;
        assert.equal(reservation.userId, owner.id);
        assert.equal(reservation.titleComputed, owner.username);
        assert.isNull(reservation.title);
    });

    test("EVENT_ADMIN creates for an existing email through the native HTTP route", async ({
        client,
        assert,
    }) => {
        const response = await client
            .post(base())
            .header("Authorization", adminToken)
            .json({ ...allocation(), userEmail: owner.email });
        response.assertStatus(200);
        const reservation = response.body().reservation;
        assert.equal(reservation.userId, owner.id);
        assert.equal(reservation.user.id, owner.id);
        assert.equal(reservation.titleComputed, owner.username);
        const persisted = await db.from("room_reservations").where("id", reservation.id).first();
        assert.equal(persisted.user_id, owner.id);
    });

    test("a non-admin cannot delegate and no reservation is written", async ({
        client,
        assert,
    }) => {
        const response = await client
            .post(base())
            .header("Authorization", ownerToken)
            .json({ ...allocation(), userEmail: admin.email });
        response.assertStatus(403);
        assert.equal(response.body().code, "FORBIDDEN");
        assert.lengthOf(await db.from("room_reservations").where("office_room_id", room.id), 0);
    });

    test("invalid or missing target accounts never fall back to the admin", async ({
        client,
        assert,
    }) => {
        for (const [userEmail, status] of [
            ["not-an-email", 422],
            [`${prefix}-missing@example.test`, 404],
        ] as const) {
            const response = await client
                .post(base())
                .header("Authorization", adminToken)
                .json({ ...allocation(), userEmail });
            response.assertStatus(status);
        }
        assert.lengthOf(await db.from("room_reservations").where("office_room_id", room.id), 0);
    });

    test("delegated bookings remain readable, editable and cancellable through existing routes", async ({
        client,
        assert,
    }) => {
        const response = await client
            .post(base())
            .header("Authorization", adminToken)
            .json({ ...allocation(), userEmail: owner.email, title: "Team meeting" });
        response.assertStatus(200);
        const id = response.body().reservation.id;
        const planning = await client
            .get(`${base()}?range[]=${encodeURIComponent(start)}`)
            .header("Authorization", ownerToken);
        planning.assertStatus(200);
        assert.include(
            planning.body().map((row: { id: number }) => row.id),
            id,
        );
        const updated = await client
            .put(`${base()}/${id}`)
            .header("Authorization", adminToken)
            .json({ ...allocation(), end: "2030-01-15T10:30:00.000Z", title: "Team meeting" });
        updated.assertStatus(200);
        const detail = await client.get(`${base()}/${id}`).header("Authorization", ownerToken);
        detail.assertStatus(200);
        assert.equal(detail.body().userId, owner.id);
        assert.equal(detail.body().title, "Team meeting");
        assert.equal(Date.parse(detail.body().end), Date.parse("2030-01-15T10:30:00.000Z"));
        (await client.delete(`${base()}/${id}`).header("Authorization", ownerToken)).assertStatus(
            200,
        );
        assert.isNull(await db.from("room_reservations").where("id", id).first());
    });
});
