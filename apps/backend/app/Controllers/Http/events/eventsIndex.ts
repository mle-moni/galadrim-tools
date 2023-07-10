import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const indexRoute = async (_params: HttpContextContract) => {
    const events = Event.query()
        .whereRaw(
            'events.start > DATE_SUB(NOW(), INTERVAL 7 DAY) AND events.start < DATE_ADD(NOW(), INTERVAL 7 DAY)'
        )
        .orderBy('id', 'desc')

    return events
}
