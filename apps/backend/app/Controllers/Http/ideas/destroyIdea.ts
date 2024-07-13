import type { HttpContext } from '@adonisjs/core/http'
import Idea from '#app/Models/Idea'
import Ws from '#app/Services/Ws'

export const destroyIdeaRoute = async ({ params, bouncer }: HttpContext) => {
    const idea = await Idea.findOrFail(params.id)
    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    const deleletedId = idea.id

    await idea.delete()

    Ws.io.to('connectedSockets').emit('deleteIdea', deleletedId)

    return { message: "L'idée à bien été supprimée" }
}
