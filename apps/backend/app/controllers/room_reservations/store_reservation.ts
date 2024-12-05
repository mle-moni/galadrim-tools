import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";
import { DateTime } from "luxon";

const validationSchema = vine.compile(
    vine.object({
        title: vine.string().trim().optional(),
        start: vine.date({ formats: { utc: true } }),
        end: vine.date({ formats: { utc: true } }),
        officeRoomId: vine
            .number()
            .exists(async (db, value) =>
                Boolean(await db.from("office_rooms").where("id", value).first()),
            ),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, {
    title: "titre",
    start: "date de début",
    end: "date de fin",
    officeRoomId: "salle",
});

export const storeReservation = async ({ request, auth, response }: HttpContext) => {
    const user = auth.user!;
    const { start, end, officeRoomId, title } = await request.validateUsing(validationSchema, {
        messagesProvider,
    });
    const foundRoom = await OfficeRoom.findOrFail(officeRoomId);
    if (!foundRoom.isBookable) {
        return response.badRequest({
            error: `La salle n'est pas réservable`,
        });
    }

    if (foundRoom.isPhonebox) {
        return response.badRequest({
            error: "Les phone box ne sont pas réservables",
        });
    }

    const startDate = DateTime.fromJSDate(start);
    const endDate = DateTime.fromJSDate(end);

    if (startDate.day !== endDate.day) {
        return response.badRequest({
            error: "La date de début et la date de fin doivent être sur la même journée",
        });
    }

    const reservation = await RoomReservation.create({
        title: title ?? null,
        start: startDate,
        end: endDate,
        officeRoomId,
        userId: user.id,
    });

    await reservation.load("user");

    Ws.io.to(CONNECTED_SOCKETS).emit("createRoomReservation", reservation);

    return {
        message: "Salle réservée",
        reservation,
    };
};
