import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantChoice from 'App/Models/RestaurantChoice'
import RestaurantReview from 'App/Models/RestaurantReview'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const showRestaurantRewind = async ({ params }: HttpContextContract) => {
    const { id } = await validateResourceId(params)

    const choices = await RestaurantChoice.query().where('user_id', id)

    const restaurantRewind = await RestaurantReview.findOrFail(id)

    return restaurantRewind
}
