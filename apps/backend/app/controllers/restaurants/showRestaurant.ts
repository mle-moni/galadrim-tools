import Restaurant from '#models/restaurant'
import { HttpContext } from '@adonisjs/core/http'

export const showRoute = async ({ params }: HttpContext) => {
  const restaurant = await Restaurant.fetchById(params.id)
  return restaurant
}
