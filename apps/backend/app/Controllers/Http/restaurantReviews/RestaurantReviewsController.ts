import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyRestaurantReview } from '#app/Controllers/Http/restaurantReviews/destroyRestaurantReview'
import { restaurantReviewsList } from '#app/Controllers/Http/restaurantReviews/restaurantReviewsList'
import { showRestaurantReview } from '#app/Controllers/Http/restaurantReviews/showRestaurantReview'
import { storeRestaurantReview } from '#app/Controllers/Http/restaurantReviews/storeRestaurantReview'
import { updateRestaurantReview } from '#app/Controllers/Http/restaurantReviews/updateRestaurantReview'

export default class RestaurantReviewsController {
    public async index(ctx: HttpContextContract) {
        return restaurantReviewsList(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storeRestaurantReview(ctx)
    }

    public async show(ctx: HttpContextContract) {
        return showRestaurantReview(ctx)
    }

    public async update(ctx: HttpContextContract) {
        return updateRestaurantReview(ctx)
    }

    public async destroy(ctx: HttpContextContract) {
        return destroyRestaurantReview(ctx)
    }
}
