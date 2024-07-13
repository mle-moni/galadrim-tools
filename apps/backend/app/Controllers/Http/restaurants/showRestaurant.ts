import { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#app/Models/Restaurant'

export const showRoute = async ({ params }: HttpContext) => {
    const restaurant = await Restaurant.fetchById(params.id)
    return restaurant
}
