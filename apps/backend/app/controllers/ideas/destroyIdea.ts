import Idea from '#models/idea'
import { Ws } from '#services/ws'
import type { HttpContext } from '@adonisjs/core/http'

export const destroyIdeaRoute = async ({ params, bouncer }: HttpContext) => {
  const idea = await Idea.findOrFail(params.id)
  await bouncer.with('ResourcePolicy').authorize('viewUpdateOrDelete', idea, 'IDEAS_ADMIN')

  const deleletedId = idea.id

  await idea.delete()

  Ws.io.to('connectedSockets').emit('deleteIdea', deleletedId)

  return { message: "L'idée à bien été supprimée" }
}
