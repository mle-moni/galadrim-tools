import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from 'App/Models/Restaurant'

export const indexRoute = async (_params: HttpContextContract) => {
    const restaurants = await Restaurant.all()
    return restaurants.map((restaurant) => restaurant.frontendData)
}
