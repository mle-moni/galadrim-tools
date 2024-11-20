import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";

const validationSchema = vine.compile(
    vine.object({
        start: vine.date({ formats: { utc: true } }),
        end: vine.date({ formats: { utc: true } }),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, {
    start: "date de début",
    end: "date de fin",
});

export const availableRooms = async ({ request }: HttpContext) => {
    const { start, end } = await request.validateUsing(validationSchema, { messagesProvider });

    // get all events with dates incompatible with the new event
    const reservations = await RoomReservation.query()
        .where("end", ">", start)
        .andWhere("start", "<", end);
    const unavailableRooms = new Set(reservations.map((reservation) => reservation.officeRoomId));
    const unavailableRoomIds = Array.from(unavailableRooms);
    const rooms = await OfficeRoom.query().whereNotIn("id", unavailableRoomIds);

    return rooms;
};
