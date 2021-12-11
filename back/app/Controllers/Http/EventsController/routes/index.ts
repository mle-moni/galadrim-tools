import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const indexRoute = async (_params: HttpContextContract) => {
    return Event.all()
}
