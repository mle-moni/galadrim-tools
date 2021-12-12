import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'
import Ws from 'App/Services/Ws'
import { validateEventsParams } from './store'

export const updateRoute = async ({ params, request, auth, response }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    const user = auth.user!
    if (event.userId !== user.id) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    const { start, end, room } = await validateEventsParams(request)
    event.start = start
    event.end = end
    event.room = room
    await event.save()
    Ws.io.to('connectedSockets').emit('updateEvent', event)
    return event
}
