import { isReservationServiceError } from "#services/reservation_errors";
import { roomReservationService } from "#services/room_reservation_service";
import type { HttpContext } from "@adonisjs/core/http";

export const availableRooms = async ({ auth, request, response }: HttpContext) => {
    const user = auth.user!;
    const queryString = request.qs();
    const start = queryString.start ?? null;
    const end = queryString.end ?? null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const invalidDate =
        startDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date";

    if (invalidDate || !start || !end) {
        return response.badRequest({
            error: "Invalid Date",
        });
    }

    try {
        return roomReservationService.availableRooms({
            start: startDate,
            end: endDate,
            officeId: user.officeId,
        });
    } catch (error) {
        if (isReservationServiceError(error)) {
            return response.status(error.status).send({ error: error.message, code: error.code });
        }
        throw error;
    }
};
