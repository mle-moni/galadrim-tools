import { roomReservationService } from "#services/room_reservation_service";
import type { HttpContext } from "@adonisjs/core/http";

export const showReservation = async ({ params }: HttpContext) => {
    return roomReservationService.show(+params.id);
};
