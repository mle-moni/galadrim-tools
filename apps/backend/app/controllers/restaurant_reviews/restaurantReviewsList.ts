import RestaurantReview from "#models/restaurant_review";
import type { HttpContext } from "@adonisjs/core/http";
import { validateRestaurantId } from "./validateRestaurantId.js";

export const restaurantReviewsList = async ({ params }: HttpContext) => {
    const { restaurantId } = await validateRestaurantId(params);
    const restaurantReviews = await RestaurantReview.query().where("restaurantId", restaurantId);

    return restaurantReviews;
};
