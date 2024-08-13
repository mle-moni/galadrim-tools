import RestaurantReview from "#models/restaurant_review";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import { validateResourceId } from "../../helpers/validate_resource_id.js";

export const destroyRestaurantReview = async ({ params, bouncer }: HttpContext) => {
    const { id } = await validateResourceId(params);
    const restaurantReview = await RestaurantReview.findOrFail(id);

    await bouncer
        .with("ResourcePolicy")
        .authorize("viewUpdateOrDelete", restaurantReview, "MIAM_ADMIN");

    const deletedId = restaurantReview.id;

    await restaurantReview.delete();

    Ws.io.to("connectedSockets").emit("deleteRestaurantReview", deletedId);

    return { message: "Cet avis de restaurant à bien été supprimé", deletedId };
};
