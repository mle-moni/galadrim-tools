import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'App/Models/Idea'
import IdeaComment from 'App/Models/IdeaComment'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'

const ideaSchema = schema.create({
    message: schema.string({ trim: true }),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
})

const notifyUser = async (ideaId: number, user: User) => {
    const idea = await Idea.findOrFail(ideaId)
    await idea.load('ideaVotes')
    await idea.load('ideaComments')

    Ws.io.to('connectedSockets').except(user.personalSocket).emit('updateIdea', idea.frontendData)
    Ws.io.to(user.personalSocket).emit('updateIdea', idea.getUserFrontendData(user.id))
}

export const createCommentRoute = async ({ auth, request }: HttpContextContract) => {
    const user = auth.user!
    const userId = user.id
    const { message, ideaId } = await request.validate({
        schema: ideaSchema,
    })

    const ideaComment = await IdeaComment.create({ ideaId, userId, message })

    await notifyUser(ideaId, user)

    return { message: `Votre commentaire à bien été envoyé`, ideaComment: ideaComment.frontendData }
}
