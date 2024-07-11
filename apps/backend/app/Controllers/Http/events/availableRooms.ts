import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const availableRooms = async ({ request, response }: HttpContextContract) => {
    const queryString = request.qs()
    const start = queryString.start ?? null
    const end = queryString.end ?? null

    const startDate = new Date(start)
    const endDate = new Date(end)

    const invalidDate =
        startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date'

    if (invalidDate || !start || !end) {
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
        'Le Cube',
        "L'Arche",
        'Nantes - Le boudoir',
        'Nantes - La cave',
        'Nantes - La salle de torture',
        'Nantes - Le placard',
        // TODO: rajouter les vrais noms des salles
        'Saint Paul - Salle Adaly 1',
        'Saint Paul - Salle Adaly 2',
        'Saint Paul - Salle Adaly 3',
        'Saint Paul - Salle Designer',
        'Saint Paul (3e) - Salle 1',
        'Saint Paul (3e) - Salle 2',
    ]

    // get all events with dates incompatible with the new event
    const res = await Event.query().where('end', '>', startDate).andWhere('start', '<', endDate)

    const unavailableRooms = new Set(res.map((event) => event.room))

    return rooms.filter((room) => !unavailableRooms.has(room))
}
