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
        title: vine.string().trim(),
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

export const updateReservation = async ({ params, bouncer, request, response }: HttpContext) => {
    const found = await RoomReservation.query()
        .where("id", params.id)
        .preload("user")
        .firstOrFail();

    const { end, start, officeRoomId, title } = await request.validateUsing(validationSchema, {
        messagesProvider,
    });

    const foundRoom = await OfficeRoom.findOrFail(officeRoomId);
    if (!foundRoom.isBookable) {
        return response.badRequest({
            error: `La salle n'est pas réservable`,
        });
    }

    await bouncer.with("ResourcePolicy").authorize("viewUpdateOrDelete", found, "EVENT_ADMIN");

    const startDate = DateTime.fromJSDate(start);
    const endDate = DateTime.fromJSDate(end);

    if (startDate.day !== endDate.day) {
        return response.badRequest({
            error: "La date de début et la date de fin doivent être sur la même journée",
        });
    }

    found.title = title;
    found.start = startDate;
    found.end = endDate;
    found.officeRoomId = officeRoomId;

    await found.save();

    Ws.io.to(CONNECTED_SOCKETS).emit("updateRoomReservation", found);

    return { message: "Reservation supprimée", reservation: found };
};
