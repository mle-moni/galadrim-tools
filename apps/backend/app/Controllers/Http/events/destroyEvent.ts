import { hasRights } from '@galadrim-tools/shared/'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '#app/Models/Event'
import Ws from '#app/Services/Ws'

export const destroyRoute = async ({ params, auth, response }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    const user = auth.user!
    if (event.userId !== user.id && !hasRights(user.rights, ['EVENT_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    const eventJson = event.toJSON()
    await event.delete()
    Ws.io.to('connectedSockets').emit('deleteEvent', eventJson)
    return { id: event.id, deleted: true }
}
