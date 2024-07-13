import { HttpContext } from '@adonisjs/core/http'
import Event from '#app/Models/Event'

export const showRoute = ({ params }: HttpContext) => {
    return Event.findOrFail(params.id)
}
