import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

const EVENTS_LIMIT = 200

export const indexRoute = async (_params: HttpContextContract) => {
    const events = Event.query().limit(EVENTS_LIMIT).orderBy('id', 'desc')

    return events
}
