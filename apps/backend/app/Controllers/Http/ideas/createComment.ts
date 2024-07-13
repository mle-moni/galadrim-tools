import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from '#app/Models/Idea'
import IdeaComment from '#app/Models/IdeaComment'
import User from '#app/Models/User'
import Ws from '#app/Services/Ws'
import { createNotificationForUser, cropText } from '#app/Services/notifications'

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
    const idea = await Idea.query().where('id', ideaId).preload('ideaComments').firstOrFail()

    const ideaComment = await IdeaComment.create({ ideaId, userId, message })

    await notifyUser(ideaId, user)

    const usersArr = idea.ideaComments.map((comment) => comment.userId)
    usersArr.push(idea.userId)

    const set = new Set(usersArr)

    set.delete(userId)

    const userIds = Array.from(set)

    const users = await User.query().whereIn('id', userIds)

    await Promise.all(
        users.map((u) =>
            createNotificationForUser(
                {
                    title: 'Nouveau commentaire',
                    text: `Commentaire sur l'idée : ${cropText(idea.text, 20)} par ${
                        user.username
                    }`,
                    type: 'NEW_IDEA_COMMENT',
                    link: `/ideas?ideaId=${idea.id}`,
                },
                u
            )
        )
    )

    return { message: `Votre commentaire à bien été envoyé`, ideaComment: ideaComment.frontendData }
}
