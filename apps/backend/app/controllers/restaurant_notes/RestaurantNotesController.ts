import type { HttpContext } from "@adonisjs/core/http";
import { destroyRoute } from "./destroyRestaurantNotes.js";
import { myRestaurantNotes } from "./myRestaurantNotes.js";
import { indexRoute } from "./restaurantNotesIndex.js";
import { showRoute } from "./showRestaurantNotes.js";
import { storeOrUpdateRoute } from "./storeOrUpdateRestaurantNotes.js";

export default class RestaurantNotesController {
    public async index(params: HttpContext) {
        return indexRoute(params);
    }

    public async store(params: HttpContext) {
        return storeOrUpdateRoute(params);
    }

    public async show(params: HttpContext) {
        return showRoute(params);
    }

    public async update(params: HttpContext) {
        return storeOrUpdateRoute(params);
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params);
    }

    public async mine(params: HttpContext) {
        return myRestaurantNotes(params);
    }
}
