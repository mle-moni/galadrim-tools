import Event from '#models/event'
import { HttpContext } from '@adonisjs/core/http'

export const showRoute = ({ params }: HttpContext) => {
  return Event.findOrFail(params.id)
}
