import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";
import { reservationUserSelector } from "./reservation_user_selecter.js";

export const showReservation = async ({ params }: HttpContext) => {
    const reservation = await RoomReservation.query()
        .where("id", params.id)
        .preload("user", reservationUserSelector)
        .firstOrFail();

    return reservation;
};
