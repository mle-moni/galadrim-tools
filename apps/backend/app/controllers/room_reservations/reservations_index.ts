import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import { roomReservationService } from "#services/room_reservation_service";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";

const validationSchema = vine.compile(
    vine.object({
        range: vine.array(vine.date({ formats: { utc: true } })),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG);

export const reservationsIndex = async ({ params, request }: HttpContext) => {
    const { officeId } = params;
    const searchParams = await validationSchema.validate(request.qs(), {
        messagesProvider,
    });

    return roomReservationService.listForOfficeDays(+officeId, searchParams.range);
};
