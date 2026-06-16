import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { isReservationServiceError } from "#services/reservation_errors";
import { roomReservationService } from "#services/room_reservation_service";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";

export const deleteReservation = async ({ params, auth, response }: HttpContext) => {
    const idToDelete = +params.id;
    const user = auth.user!;

    try {
        await roomReservationService.delete(user, idToDelete);

        Ws.io.to(CONNECTED_SOCKETS).emit("deleteRoomReservation", idToDelete);

        return { message: "Reservation supprimée", deletedId: idToDelete };
    } catch (error) {
        if (isReservationServiceError(error)) {
            return response.status(error.status).send({ error: error.message, code: error.code });
        }
        throw error;
    }
};
