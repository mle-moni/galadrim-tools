import { HttpContext } from '@adonisjs/core/http'
import Event from '#app/Models/Event'

export const getAllEvents = async (_params: HttpContext) => {
    return Event.all()
}
