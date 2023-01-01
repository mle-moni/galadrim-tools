import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'App/Models/Idea'
import { createNotificationForUsers, cropText } from 'App/Services/notifications'
import Ws from 'App/Services/Ws'

const ideaSchema = schema.create({
    text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
    isAnonymous: schema.boolean(),
})

export const storeIdeaRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!
    const { text, isAnonymous } = await request.validate({
        schema: ideaSchema,
    })

    const createdIdea = await Idea.create({ userId: user.id, text, isAnonymous, state: 'TODO' })
    await createdIdea.load('ideaVotes')
    await createdIdea.load('ideaComments')

    Ws.io
        .to('connectedSockets')
        .except(user.personalSocket)
        .emit('createIdea', createdIdea.frontendData)
    Ws.io.to(user.personalSocket).emit('createIdea', createdIdea.getUserFrontendData(user.id))

    const username = isAnonymous ? 'une personne anonyme 🥸' : user.username

    createNotificationForUsers(
        {
            title: 'Nouvelle idée dans la boîte à idée',
            text: `${cropText(text)} ajouté par ${username}`,
            type: 'NEW_IDEA',
            link: '/ideas',
        },
        user.id
    )

    return { message: "L'idée à été créé !", idea: createdIdea.frontendData }
}
