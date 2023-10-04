import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const availableRooms = async ({ request, response }: HttpContextContract) => {
    const start = request.param('start', null)
    const end = request.param('end', null)

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date') {
        return response.badRequest({
            error: 'Invalid Date',
        })
    }

    const rooms = [
        'Salle Vador',
        'Salle Adier',
        'Salle Turing',
        'Salle manguier massif',
        'Salle du coffre',
        'Cuisine',
        'Phone box',
    ]

    // get all events with dates incompatible with the new event
    const res = await Event.query()
        .whereBetween('start', [startDate, endDate])
        .orWhereBetween('end', [startDate, endDate])

    const unavailableRooms = new Set(res.map((event) => event.room))

    return rooms.filter((room) => !unavailableRooms.has(room))
}
