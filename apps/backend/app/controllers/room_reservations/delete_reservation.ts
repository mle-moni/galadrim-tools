import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import RoomReservation from "#models/room_reservation";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";

export const deleteReservation = async ({ params, bouncer }: HttpContext) => {
    const idToDelete = +params.id;
    const found = await RoomReservation.findOrFail(idToDelete);

    await bouncer.with("ResourcePolicy").authorize("viewUpdateOrDelete", found);

    await found.delete();

    Ws.io.to(CONNECTED_SOCKETS).emit("deleteRoomReservation", idToDelete);

    return { message: "Reservation supprimée", deletedId: idToDelete };
};
