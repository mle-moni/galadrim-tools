import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Idea from '../../../../Models/Idea'
import Ws from '../../../../Services/Ws'

export const destroyIdeaRoute = async ({ params, bouncer }: HttpContextContract) => {
    const idea = await Idea.findOrFail(params.id)
    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    const deleletedId = idea.id

    await idea.delete()

    Ws.io.to('connectedSockets').emit('deleteIdea', deleletedId)

    return { message: "L'idée à bien été supprimée" }
}
