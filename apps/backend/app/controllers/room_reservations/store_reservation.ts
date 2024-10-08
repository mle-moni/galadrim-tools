import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import RoomReservation from "#models/room_reservation";
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

export const storeReservation = async ({ request, auth }: HttpContext) => {
    const user = auth.user!;
    const { start, end, officeRoomId, title } = await request.validateUsing(validationSchema, {
        messagesProvider,
    });

    const reservation = await RoomReservation.create({
        title: title ?? null,
        start: DateTime.fromJSDate(start),
        end: DateTime.fromJSDate(end),
        officeRoomId,
        userId: user.id,
    });

    await reservation.load("user");

    return {
        message: "Salle réservée",
        reservation,
    };
};
