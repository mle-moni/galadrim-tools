import { HttpContext } from '@adonisjs/core/http'
import { destroyRestaurantReview } from '#app/Controllers/Http/restaurantReviews/destroyRestaurantReview'
import { restaurantReviewsList } from '#app/Controllers/Http/restaurantReviews/restaurantReviewsList'
import { showRestaurantReview } from '#app/Controllers/Http/restaurantReviews/showRestaurantReview'
import { storeRestaurantReview } from '#app/Controllers/Http/restaurantReviews/storeRestaurantReview'
import { updateRestaurantReview } from '#app/Controllers/Http/restaurantReviews/updateRestaurantReview'

export default class RestaurantReviewsController {
    public async index(ctx: HttpContext) {
        return restaurantReviewsList(ctx)
    }

    public async store(ctx: HttpContext) {
        return storeRestaurantReview(ctx)
    }

    public async show(ctx: HttpContext) {
        return showRestaurantReview(ctx)
    }

    public async update(ctx: HttpContext) {
        return updateRestaurantReview(ctx)
    }

    public async destroy(ctx: HttpContext) {
        return destroyRestaurantReview(ctx)
    }
}
