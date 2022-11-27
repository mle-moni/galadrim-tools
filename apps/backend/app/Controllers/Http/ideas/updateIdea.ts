import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'App/Models/Idea'
import Ws from 'App/Services/Ws'

const ideaSchema = schema.create({
    text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
    done: schema.boolean.optional(),
})

export const updateIdeaRoute = async ({ request, bouncer }: HttpContextContract) => {
    const { text, ideaId, done } = await request.validate({
        schema: ideaSchema,
    })
    const idea = await Idea.findOrFail(ideaId)

    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)
    await bouncer.with('IdeasPolicy').authorize('setIdeaDone', done)

    idea.text = text
    if (done !== undefined) {
        idea.done = done
    }

    await idea.save()
    await idea.load('ideaVotes')

    Ws.io.to('connectedSockets').emit('updateIdea', idea.frontendData)

    return { message: "L'idée à bien été mise à jour", idea: idea.frontendData }
}
