import Event from "#models/event";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import { hasRights } from "@galadrim-tools/shared";
import { validateEventsParams } from "./storeEvent.js";

export const updateRoute = async ({ params, request, auth, response }: HttpContext) => {
    const event = await Event.findOrFail(params.id);
    const user = auth.user!;
    if (event.userId !== user.id && !hasRights(user.rights, ["EVENT_ADMIN"])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` });
    }
    const { start, end, room, title } = await validateEventsParams(request);
    event.start = start;
    event.end = end;
    event.room = room;
    if (title) {
        event.title = title;
    }
    await event.save();
    Ws.io.to("connectedSockets").emit("updateEvent", event);
    return event;
};
