import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/validation/default_validator";
import Office from "#models/office";
import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";

const RESERVATION_TYPES = ["range", "day"] as const;
const RESERVATION_TYPES_OBJ = Object.fromEntries(RESERVATION_TYPES.map((type) => [type, type])) as {
    [K in (typeof RESERVATION_TYPES)[number]]: K;
};

const validationSchema = vine.compile(
    vine
        .object({
            searchParams: vine.union([
                vine.union.if(
                    (value) => value.type === RESERVATION_TYPES_OBJ.day,
                    vine.object({
                        type: vine.literal(RESERVATION_TYPES_OBJ.day),
                        day: vine.date({ formats: ["dd/MM/yyyy"] }),
                    }),
                ),
                vine.union.if(
                    (value) => value.type === RESERVATION_TYPES_OBJ.range,
                    vine.object({
                        type: vine.literal(RESERVATION_TYPES_OBJ.range),
                        start: vine.date(),
                        end: vine.date(),
                    }),
                ),
            ]),
        })
        .optional(),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG);

export const reservationsIndex = async ({ params, request }: HttpContext) => {
    const { officeId } = params;
    const office = await Office.query().where("id", officeId).preload("rooms").firstOrFail();
    const options = await validationSchema.validate(request.qs(), {
        messagesProvider,
    });
    const reservationsQuery = RoomReservation.query().whereIn(
        "id",
        office.rooms.map((r) => r.id),
    );

    if (options?.searchParams.type === RESERVATION_TYPES_OBJ.day) {
        reservationsQuery.whereRaw("DATE(start) = DATE(?)", [options.searchParams.day]);
    } else if (options?.searchParams.type === RESERVATION_TYPES_OBJ.range) {
        reservationsQuery.whereBetween("start", [
            options.searchParams.start,
            options.searchParams.end,
        ]);
    }

    const reservations = await reservationsQuery;

    return reservations;
};
