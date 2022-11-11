import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Idea from 'apps/backend/app/Models/Idea'

const ideaSchema = schema.create({
    text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
})

export const updateIdeaRoute = async ({ request, bouncer }: HttpContextContract) => {
    const { text, ideaId } = await request.validate({
        schema: ideaSchema,
    })
    const idea = await Idea.findOrFail(ideaId)

    await bouncer.with('IdeasPolicy').authorize('viewUpdateOrDelete', idea)

    idea.text = text
    await idea.save()
    await idea.load('ideaVotes')

    return { message: "L'idée à bien été mise à jour", idea: idea.frontendData }
}
