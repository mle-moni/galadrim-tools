import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Idea from 'App/Models/Idea'

export const showIdeaRoute = async ({ params, bouncer }: HttpContextContract) => {
    const idea = await Idea.findOrFail(params.id)
    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    return idea
}
