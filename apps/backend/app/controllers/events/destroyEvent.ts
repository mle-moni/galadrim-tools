import Event from '#models/event'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { hasRights } from '@galadrim-tools/shared'

export const destroyRoute = async ({ params, auth, response }: HttpContext) => {
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
