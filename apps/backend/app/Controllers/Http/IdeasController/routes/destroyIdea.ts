import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Idea from '../../../../Models/Idea'

export const destroyIdeaRoute = async ({ params, bouncer }: HttpContextContract) => {
    const idea = await Idea.findOrFail(params.id)
    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    await idea.delete()

    return { message: "L'idée à bien été supprimée" }
}
