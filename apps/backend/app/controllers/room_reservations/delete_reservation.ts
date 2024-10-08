import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";

export const deleteReservation = async ({ params, bouncer }: HttpContext) => {
    const found = await RoomReservation.findOrFail(params.id);

    await bouncer.with("ResourcePolicy").authorize("viewUpdateOrDelete", found);

    await found.delete();

    return { message: "Reservation supprimée", deletedId: params.id };
};
