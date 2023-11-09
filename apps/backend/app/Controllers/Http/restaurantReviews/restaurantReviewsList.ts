import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateRestaurantId } from 'App/Controllers/Http/restaurantReviews/validateRestaurantId'
import RestaurantReview from 'App/Models/RestaurantReview'

export const restaurantReviewsList = async ({ params }: HttpContextContract) => {
    const { restaurantId } = await validateRestaurantId(params)
    const restaurantReviews = await RestaurantReview.query().where('restaurantId', restaurantId)

    return restaurantReviews
}
