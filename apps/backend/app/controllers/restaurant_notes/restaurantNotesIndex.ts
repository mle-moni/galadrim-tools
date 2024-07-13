import RestaurantNote from '#models/restaurant_note'
import { HttpContext } from '@adonisjs/core/http'

export const indexRoute = async (_params: HttpContext) => {
  const restaurantNotes = await RestaurantNote.all()
  return restaurantNotes.map((note) => note.frontendData)
}
