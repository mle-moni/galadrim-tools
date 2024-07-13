import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '#app/Models/Event'

export const getAllEvents = async (_params: HttpContextContract) => {
    return Event.all()
}
