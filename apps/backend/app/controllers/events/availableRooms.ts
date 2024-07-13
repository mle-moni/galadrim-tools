import Event from '#models/event'
import { HttpContext } from '@adonisjs/core/http'

export const availableRooms = async ({ request, response }: HttpContext) => {
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
  ]

  // get all events with dates incompatible with the new event
  const res = await Event.query().where('end', '>', startDate).andWhere('start', '<', endDate)

  const unavailableRooms = new Set(res.map((event) => event.room))

  return rooms.filter((room) => !unavailableRooms.has(room))
}
