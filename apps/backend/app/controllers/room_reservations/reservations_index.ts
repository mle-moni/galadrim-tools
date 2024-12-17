import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import Office from "#models/office";
import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";
import { reservationUserSelector } from "./reservation_user_selecter.js";

const validationSchema = vine.compile(
    vine.object({
        range: vine.array(vine.date({ formats: { utc: true } })),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG);

export const reservationsIndex = async ({ params, request }: HttpContext) => {
    const { officeId } = params;
    const office = await Office.query().where("id", officeId).preload("rooms").firstOrFail();
    const searchParams = await validationSchema.validate(request.qs(), {
        messagesProvider,
    });
    const reservationsQuery = RoomReservation.query().whereIn(
        "officeRoomId",
        office.rooms.map((r) => r.id),
    );

    reservationsQuery.where((q) => {
        searchParams.range.forEach((date) => {
            q.orWhere((q) =>
                q.where("start", ">", date).andWhereRaw("start < ? + INTERVAL 1 DAY", [date]),
            );
        });
    });

    const reservations = await reservationsQuery.preload("user", reservationUserSelector);

    return reservations;
};
