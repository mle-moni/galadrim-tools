import Restaurant from '#models/restaurant'
import { HttpContext } from '@adonisjs/core/http'

export const indexRoute = async (_params: HttpContext) => {
  const restaurants = await Restaurant.all()
  return restaurants.map((restaurant) => restaurant.frontendData)
}
