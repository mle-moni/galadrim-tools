import { hasRights } from '@galadrim-tools/shared'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '../../../../Models/Event'
import Ws from '../../../../Services/Ws'
import { validateEventsParams } from './store'

export const updateRoute = async ({ params, request, auth, response }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    const user = auth.user!
    if (event.userId !== user.id && !hasRights(user.rights, ['EVENT_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    const { start, end, room, title } = await validateEventsParams(request)
    event.start = start
    event.end = end
    event.room = room
    if (title) {
        event.title = title
    }
    await event.save()
    Ws.io.to('connectedSockets').emit('updateEvent', event)
    return event
}
