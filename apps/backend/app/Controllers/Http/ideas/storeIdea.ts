import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'App/Models/Idea'
import Ws from 'App/Services/Ws'

const ideaSchema = schema.create({
    text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
})

export const storeIdeaRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!
    const { text } = await request.validate({
        schema: ideaSchema,
    })

    const createdIdea = await Idea.create({ userId: user.id, text })
    await createdIdea.load('ideaVotes')

    Ws.io.to('connectedSockets').emit('createIdea', createdIdea.frontendData)

    return { message: "L'idée à été créé !", idea: createdIdea.frontendData }
}
