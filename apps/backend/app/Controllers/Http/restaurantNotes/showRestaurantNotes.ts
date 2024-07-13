import { HttpContext } from '@adonisjs/core/http'
import RestaurantNote from '#app/Models/RestaurantNote'

export const showRoute = async ({ params }: HttpContext) => {
    const restaurantNote = await RestaurantNote.findOrFail(params.id)
    return restaurantNote.frontendData
}
