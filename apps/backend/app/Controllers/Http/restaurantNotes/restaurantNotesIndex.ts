import { HttpContext } from '@adonisjs/core/http'
import RestaurantNote from '#app/Models/RestaurantNote'

export const indexRoute = async (_params: HttpContext) => {
    const restaurantNotes = await RestaurantNote.all()
    return restaurantNotes.map((note) => note.frontendData)
}
