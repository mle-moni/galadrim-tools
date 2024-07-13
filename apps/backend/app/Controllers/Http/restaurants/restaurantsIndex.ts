import { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#app/Models/Restaurant'

export const indexRoute = async (_params: HttpContext) => {
    const restaurants = await Restaurant.all()
    return restaurants.map((restaurant) => restaurant.frontendData)
}
