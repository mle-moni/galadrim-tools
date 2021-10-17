import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'
export const indexRoute = async (_params: HttpContextContract) => {
    await Event.query().whereRaw('events.start <= CURRENT_DATE() - INTERVAL 1 DAY').delete()
    return Event.all()
}
