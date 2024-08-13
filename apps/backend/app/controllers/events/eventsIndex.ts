import Event from "#models/event";
import type { HttpContext } from "@adonisjs/core/http";

export const indexRoute = async (_params: HttpContext) => {
    const events = Event.query()
        .whereRaw("events.start > DATE_SUB(NOW(), INTERVAL 7 DAY)")
        .orderBy("id", "desc");

    return events;
};
