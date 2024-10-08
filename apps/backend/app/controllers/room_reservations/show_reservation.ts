import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";

export const showReservation = async ({ params }: HttpContext) => {
    const reservation = await RoomReservation.findOrFail(params.id);

    return reservation;
};
