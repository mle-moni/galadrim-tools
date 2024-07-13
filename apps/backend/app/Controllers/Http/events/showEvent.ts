import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '#app/Models/Event'

export const showRoute = ({ params }: HttpContextContract) => {
    return Event.findOrFail(params.id)
}
