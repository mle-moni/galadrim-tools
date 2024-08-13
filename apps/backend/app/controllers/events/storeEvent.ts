import Event from "#models/event";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import { rules, schema } from "@adonisjs/validator";

const StoreValidationSchema = schema.create({
    start: schema.date({}, [rules.beforeField("end")]),
    end: schema.date(),
    room: schema.string([rules.trim(), rules.maxLength(40), rules.minLength(2)]),
    title: schema.string.optional([rules.trim(), rules.maxLength(40), rules.minLength(2)]),
});

export const validateEventsParams = async (request: HttpContext["request"]) => {
    return request.validate({
        schema: StoreValidationSchema,
    });
};

export const storeRoute = async ({ request, auth }: HttpContext) => {
    const { start, end, room, title } = await validateEventsParams(request);
    const user = auth.user!;
    const event = await Event.create({
        start,
        end,
        title: title || user.username,
        room,
        userId: user.id,
    });
    Ws.io.to("connectedSockets").emit("createEvent", event);
    return event;
};
