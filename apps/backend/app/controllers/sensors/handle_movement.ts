import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import User from "#models/user";
import { Ws } from "#services/ws";
import env from "#start/env";
import { cuid } from "@adonisjs/core/helpers";
import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";

const validationSchema = vine.compile(
    vine.object({
        id: vine.number(),
        secret: vine.string(),
    }),
);

export const handleMovement = async ({ request, response }: HttpContext) => {
    const { id, secret } = await request.validateUsing(validationSchema);

    console.log("sensor ID", id);
    console.log("sensor secret", secret);

    if (secret !== env.get("SENSORS_SECRET")) {
        return response.badRequest({
            error: "secret invalide",
        });
    }

    const botUser = await getOrCreateBotUser();

    const phoneBox = await OfficeRoom.query()
        .where("id", id)
        .andWhere("is_phonebox", true)
        .firstOrFail();

    const reservation = await RoomReservation.create({
        title: null,
        officeRoomId: phoneBox.id,
        userId: botUser.id,
        start: DateTime.now(),
        end: DateTime.now().plus({ minutes: 3 }),
    });

    Ws.io.to(CONNECTED_SOCKETS).emit("createRoomReservation", reservation);

    return { message: "OK" };
};

const getOrCreateBotUser = async () => {
    const botUser = await User.findBy("email", "bot@galadrim.fr");

    if (botUser) return botUser;

    return await User.create({
        email: "bot@galadrim.fr",
        password: cuid(),
        username: "Galabot",
    });
};
