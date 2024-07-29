import Idea from '#models/idea'
import IdeaComment from '#models/idea_comment'
import User from '#models/user'
import { createNotificationForUser, cropText } from '#services/notifications'
import { Ws } from '#services/ws'
import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'

const ideaSchema = schema.create({
  message: schema.string({ trim: true }),
  ideaId: schema.number(),
})

const notifyUser = async (ideaId: number, user: User) => {
  const idea = await Idea.findOrFail(ideaId)
  await idea.load('ideaVotes')
  await idea.load('ideaComments')

  Ws.io.to('connectedSockets').except(user.personalSocket).emit('updateIdea', idea.frontendData)
  Ws.io.to(user.personalSocket).emit('updateIdea', idea.getUserFrontendData(user.id))
}

export const createCommentRoute = async ({ auth, request }: HttpContext) => {
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
          text: `Commentaire sur l'idée : ${cropText(idea.text, 20)} par ${user.username}`,
          type: 'NEW_IDEA_COMMENT',
          link: `/ideas?ideaId=${idea.id}`,
        },
        u
      )
    )
  )

  return { message: `Votre commentaire à bien été envoyé`, ideaComment: ideaComment.frontendData }
}
