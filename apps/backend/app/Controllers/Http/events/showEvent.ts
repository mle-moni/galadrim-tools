import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const showRoute = ({ params }: HttpContextContract) => {
    return Event.findOrFail(params.id)
}
