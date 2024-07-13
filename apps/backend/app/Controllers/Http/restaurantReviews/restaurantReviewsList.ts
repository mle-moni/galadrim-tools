import { HttpContext } from '@adonisjs/core/http'
import { validateRestaurantId } from '#app/Controllers/Http/restaurantReviews/validateRestaurantId'
import RestaurantReview from '#app/Models/RestaurantReview'

export const restaurantReviewsList = async ({ params }: HttpContext) => {
    const { restaurantId } = await validateRestaurantId(params)
    const restaurantReviews = await RestaurantReview.query().where('restaurantId', restaurantId)

    return restaurantReviews
}
