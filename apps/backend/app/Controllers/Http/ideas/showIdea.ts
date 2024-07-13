import type { HttpContext } from '@adonisjs/core/http'
import Idea from '#app/Models/Idea'

export const showIdeaRoute = async ({ params, bouncer }: HttpContext) => {
    const idea = await Idea.findOrFail(params.id)
    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    return idea
}
