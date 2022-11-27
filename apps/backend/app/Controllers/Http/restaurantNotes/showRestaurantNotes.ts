import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantNote from 'App/Models/RestaurantNote'

export const showRoute = async ({ params }: HttpContextContract) => {
    const restaurantNote = await RestaurantNote.findOrFail(params.id)
    return restaurantNote
}
