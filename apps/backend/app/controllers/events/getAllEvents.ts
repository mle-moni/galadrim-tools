import Event from '#models/event'
import { HttpContext } from '@adonisjs/core/http'

export const getAllEvents = async (_params: HttpContext) => {
  return Event.all()
}
