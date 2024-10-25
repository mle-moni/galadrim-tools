import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";

export const showReservation = async ({ params }: HttpContext) => {
    const reservation = await RoomReservation.query()
        .where("id", params.id)
        .preload("user")
        .firstOrFail();

    return reservation;
};
