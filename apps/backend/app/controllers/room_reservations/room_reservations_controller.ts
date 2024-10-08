import type { HttpContext } from "@adonisjs/core/http";
import { deleteReservation } from "./delete_reservation.js";
import { reservationsIndex } from "./reservations_index.js";
import { showReservation } from "./show_reservation.js";
import { storeReservation } from "./store_reservation.js";
import { updateReservation } from "./update_reservation.js";

export default class RoomReservationsController {
    async index(ctx: HttpContext) {
        return reservationsIndex(ctx);
    }

    async store(ctx: HttpContext) {
        return storeReservation(ctx);
    }

    async show(ctx: HttpContext) {
        return showReservation(ctx);
    }

    async update(ctx: HttpContext) {
        return updateReservation(ctx);
    }

    async destroy(ctx: HttpContext) {
        return deleteReservation(ctx);
    }
}
