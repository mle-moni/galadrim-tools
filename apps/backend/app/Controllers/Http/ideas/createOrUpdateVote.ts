import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'App/Models/Idea'
import IdeaVote from 'App/Models/IdeaVote'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'

const ideaSchema = schema.create({
    isUpvote: schema.boolean.optional(),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
})

const notifyUser = async (ideaId: number, user: User) => {
    const idea = await Idea.findOrFail(ideaId)
    await idea.load('ideaVotes')
    await idea.load('ideaComments')

    Ws.io.to('connectedSockets').except(user.personalSocket).emit('updateIdea', idea.frontendData)
    Ws.io.to(user.personalSocket).emit('updateIdea', idea.getUserFrontendData(user.id))
}

export const createOrUpdateVoteRoute = async ({ auth, request, response }: HttpContextContract) => {
    const user = auth.user!
    const userId = user.id
    const { isUpvote, ideaId } = await request.validate({
        schema: ideaSchema,
    })

    if (isUpvote === undefined) {
        const [numberOfDeletedItems] = await IdeaVote.query()
            .where('ideaId', ideaId)
            .andWhere('userId', userId)
            .delete()
        if (numberOfDeletedItems === 1) {
            await notifyUser(ideaId, user)
            return { message: 'La reaction a été supprimée' }
        }
        return response.badRequest({ error: 'Une erreur est servenue' })
    }

    const ideaVote = await IdeaVote.updateOrCreate({ ideaId, userId }, { ideaId, userId, isUpvote })

    const reaction = isUpvote ? 'aimez' : "n'aimez pas"

    await notifyUser(ideaId, user)

    return { message: `Vous ${reaction} cette idée`, ideaVote: ideaVote.frontendData }
}
