import { IDEAS_STATE } from '@galadrim-tools/shared'
import type { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'
import Idea from '#app/Models/Idea'
import Ws from '#app/Services/Ws'

const ideaSchema = schema.create({
    text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
    state: schema.enum.optional(IDEAS_STATE),
})

export const updateIdeaRoute = async ({ request, bouncer }: HttpContext) => {
    const { text, ideaId, state } = await request.validate({
        schema: ideaSchema,
    })
    const idea = await Idea.findOrFail(ideaId)

    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    idea.text = text
    if (state !== undefined) {
        idea.state = state
    }

    await idea.save()
    await idea.load('ideaVotes')
    await idea.load('ideaComments')

    Ws.io.to('connectedSockets').emit('updateIdea', idea.frontendData)

    return { message: "L'idée à bien été mise à jour", idea: idea.frontendData }
}
