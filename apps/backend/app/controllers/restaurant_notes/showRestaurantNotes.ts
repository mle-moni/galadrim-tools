import RestaurantNote from '#models/restaurant_note'
import { HttpContext } from '@adonisjs/core/http'

export const showRoute = async ({ params }: HttpContext) => {
  const restaurantNote = await RestaurantNote.findOrFail(params.id)
  return restaurantNote.frontendData
}
