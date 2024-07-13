import { HttpContext } from '@adonisjs/core/http'
import Event from '#app/Models/Event'

export const indexRoute = async (_params: HttpContext) => {
    const events = Event.query()
        .whereRaw('events.start > DATE_SUB(NOW(), INTERVAL 7 DAY)')
        .orderBy('id', 'desc')

    return events
}
