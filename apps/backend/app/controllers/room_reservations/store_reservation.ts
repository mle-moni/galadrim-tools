import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { isReservationServiceError } from "#services/reservation_errors";
import { roomReservationService } from "#services/room_reservation_service";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";

const validationSchema = vine.compile(
    vine.object({
        title: vine.string().trim().optional(),
        start: vine.date({ formats: { utc: true } }),
        end: vine.date({ formats: { utc: true } }),
        officeRoomId: vine
            .number()
            .exists(async (db, value) =>
                Boolean(await db.from("office_rooms").where("id", value).first()),
            ),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, {
    title: "titre",
    start: "date de début",
    end: "date de fin",
    officeRoomId: "salle",
});

export const storeReservation = async ({ request, auth, response }: HttpContext) => {
    const user = auth.user!;
    const { start, end, officeRoomId, title } = await request.validateUsing(validationSchema, {
        messagesProvider,
    });

    try {
        const reservation = await roomReservationService.create(user, {
            title: title ?? null,
            start,
            end,
            officeRoomId,
        });

        Ws.io.to(CONNECTED_SOCKETS).emit("createRoomReservation", reservation);

        return {
            message: "Salle réservée",
            reservation,
        };
    } catch (error) {
        if (isReservationServiceError(error)) {
            return response.status(error.status).send({ error: error.message, code: error.code });
        }
        throw error;
    }
};
