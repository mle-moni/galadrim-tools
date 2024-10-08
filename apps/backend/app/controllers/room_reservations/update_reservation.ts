import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";
import { DateTime } from "luxon";

const validationSchema = vine.compile(
    vine.object({
        title: vine.string().trim(),
        start: vine.date(),
        end: vine.date(),
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

export const updateReservation = async ({ params, bouncer, request }: HttpContext) => {
    const found = await RoomReservation.findOrFail(params.id);

    const { end, start, officeRoomId, title } = await request.validateUsing(validationSchema, {
        messagesProvider,
    });

    await bouncer.with("ResourcePolicy").authorize("viewUpdateOrDelete", found);

    found.title = title;
    found.start = DateTime.fromJSDate(start);
    found.end = DateTime.fromJSDate(end);
    found.officeRoomId = officeRoomId;

    await found.save();

    return { message: "Reservation supprimée", reservation: found };
};
