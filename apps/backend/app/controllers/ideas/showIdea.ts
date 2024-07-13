import Idea from '#models/idea'
import type { HttpContext } from '@adonisjs/core/http'

export const showIdeaRoute = async ({ params, bouncer }: HttpContext) => {
  const idea = await Idea.findOrFail(params.id)
  await bouncer.with('ResourcePolicy').authorize('viewUpdateOrDelete', idea, 'IDEAS_ADMIN')

  return idea
}
