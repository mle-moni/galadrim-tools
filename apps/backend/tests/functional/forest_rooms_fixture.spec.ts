import { randomUUID } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import db from "@adonisjs/lucid/services/db";
import { RIGHTS } from "@galadrim-tools/shared";
import { test } from "@japa/runner";
import Office from "#models/office";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";
import User from "#models/user";
import { Ws } from "#services/ws";

// Never holds up the normal functional suite. Only the exact isolated launcher enables it.
test("hold synthetic two-application fixture until Forest finishes", async () => {
    if (
        process.env.TOOLS_ROOMS_TEST !== "1" ||
        process.env.DB_DATABASE !== "tools_forest_rooms_test"
    )
        throw new Error("Unverified fixture target");
    const rows = await db.rawQuery(
        "SELECT @@hostname AS host, DATABASE() AS db, CURRENT_USER() AS account",
    );
    const marker = await db.from("room_test_target").first();
    if (
        rows[0][0].host !== "tools-forest-rooms-test-mysql" ||
        rows[0][0].db !== "tools_forest_rooms_test" ||
        !rows[0][0].account.startsWith("rooms_test@") ||
        marker?.project !== "tools-forest-rooms-test"
    )
        throw new Error("Fixture database mismatch");
    if (await Office.find(1)) throw new Error("Isolated fixture office unexpectedly present");
    const catalog: { Code: string; Name: string; Floor: number }[] = JSON.parse(
        await readFile("/bridge-handoff/catalog.json", "utf8"),
    );
    if (
        catalog.length !== 19 ||
        new Set(catalog.map((row) => row.Code)).size !== 19 ||
        catalog.some((row) => ![2, 3, 4, 6].includes(row.Floor))
    )
        throw new Error("Unexpected synthetic catalog");
    Ws.boot();
    const owned = `forest-live-${randomUUID()}`;
    const people: User[] = [];
    let office: Office | undefined;
    let primaryError: unknown;
    let cleanupError: unknown;
    try {
        const person = async (suffix: string, username: string, rights = 0) => {
            const user = await User.create({
                username,
                email: `${owned}-${suffix}@example.test`,
                password: "synthetic",
                rights,
            });
            people.push(user);
            return user;
        };
        const principal = await person("principal", `${owned}-principal`);
        const actor = await person("owner", "Alice Démo");
        const successor = await person("successor", "Benoît Démo");
        const manager = await person("manager", "Gestionnaire Démo", RIGHTS.EVENT_ADMIN);
        office = await Office.create({ id: 1, name: owned, address: "Synthetic", lat: 0, lng: 0 });
        const floor = await OfficeFloor.create({ officeId: 1, floor: 2, config: {} });
        const room = await OfficeRoom.create({
            officeFloorId: floor.id,
            name: `${owned}-roundtrip`,
            config: { points: [] },
            isBookable: true,
            isPhonebox: false,
        });
        await OfficeRoom.create({
            officeFloorId: floor.id,
            name: `${owned}-phonebox`,
            config: { points: [] },
            isBookable: false,
            isPhonebox: true,
        });
        const floors = new Map([[2, floor]]);
        const rooms: { code: string; id: number }[] = [];
        for (const entry of catalog) {
            if (!floors.has(entry.Floor))
                floors.set(
                    entry.Floor,
                    await OfficeFloor.create({ officeId: 1, floor: entry.Floor, config: {} }),
                );
            const targetFloor = floors.get(entry.Floor);
            if (!targetFloor) throw new Error("Missing fixture floor");
            const target = await OfficeRoom.create({
                officeFloorId: targetFloor.id,
                name: entry.Name,
                config: { points: [] },
                isBookable: true,
                isPhonebox: false,
            });
            rooms.push({ code: entry.Code, id: target.id });
        }
        const integration = await User.forestRoomTokens.create(
            principal,
            ["rooms:read", "rooms:write", "rooms:end", "office:1"],
            { expiresIn: "20 minutes" },
        );
        const ordinary = await User.accessTokens.create(actor, ["*"], { expiresIn: "20 minutes" });
        const successorToken = await User.accessTokens.create(successor, ["*"], {
            expiresIn: "20 minutes",
        });
        const managerToken = await User.accessTokens.create(manager, ["*"], {
            expiresIn: "20 minutes",
        });
        if (!managerToken.value || !integration.value || !ordinary.value || !successorToken.value)
            throw new Error("Missing synthetic credential");
        await writeFile(
            "/bridge-handoff/fixture.json",
            JSON.stringify({
                owned,
                rooms,
                managerEmail: manager.email,
                managerId: String(manager.id),
                managerToken: managerToken.value.release(),
                origin: "http://tools-preview-api:3333",
                token: integration.value.release(),
                ordinaryToken: ordinary.value.release(),
                successorEmail: successor.email,
                successorId: String(successor.id),
                successorToken: successorToken.value.release(),
                email: actor.email,
                actorId: String(actor.id),
                roomId: room.id,
            }),
            { mode: 0o600 },
        );
        let finished = false;
        for (let step = 0; step < 900; step++) {
            try {
                await access("/bridge-handoff/done");
                finished = true;
                break;
            } catch (error) {
                if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT")
                    throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!finished) throw new Error("Forest fixture handshake timed out after15minutes");
    } catch (error) {
        primaryError = error;
    } finally {
        try {
            const principal = people[0];
            if (principal)
                await db.from("forest_room_requests").where("principal_id", principal.id).delete();
            if (office) {
                await office.delete();
            }
            for (const person of people.reverse()) await person.delete();
            const leftovers = await db
                .from("users")
                .whereRaw("email LIKE ?", [`${owned}-%@example.test`])
                .count("id as total")
                .first();
            if (Number(leftovers?.total) !== 0 || (office && (await Office.find(office.id))))
                cleanupError = new Error("Owned Tools fixture cleanup incomplete");
        } catch (error) {
            cleanupError = error;
        }
    }
    if (primaryError && cleanupError)
        throw new AggregateError([primaryError, cleanupError], "Fixture and owned cleanup failed");
    if (primaryError || cleanupError) throw primaryError || cleanupError;
})
    .skip(process.env.TOOLS_ROOMS_LIVE_FIXTURE !== "1")
    .timeout(950000);
