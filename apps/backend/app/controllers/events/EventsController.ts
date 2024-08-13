import type { HttpContext } from "@adonisjs/core/http";
import { availableRooms } from "./availableRooms.js";
import { destroyRoute } from "./destroyEvent.js";
import { indexRoute } from "./eventsIndex.js";
import { getAllEvents } from "./getAllEvents.js";
import { showRoute } from "./showEvent.js";
import { storeRoute } from "./storeEvent.js";
import { updateRoute } from "./updateEvent.js";

export default class EventsController {
    public async index(params: HttpContext) {
        return indexRoute(params);
    }

    public async store(params: HttpContext) {
        return storeRoute(params);
    }

    public async show(params: HttpContext) {
        return showRoute(params);
    }

    public async update(params: HttpContext) {
        return updateRoute(params);
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params);
    }

    public async all(params: HttpContext) {
        return getAllEvents(params);
    }

    public async availableRooms(params: HttpContext) {
        return availableRooms(params);
    }
}
