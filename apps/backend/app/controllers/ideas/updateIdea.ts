import Idea from '#models/idea'
import { Ws } from '#services/ws'
import type { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'
import { IDEAS_STATE } from '@galadrim-tools/shared'

const ideaSchema = schema.create({
  text: schema.string([rules.trim(), rules.maxLength(300), rules.minLength(2)]),
  ideaId: schema.number(),
  state: schema.enum.optional(IDEAS_STATE),
})

export const updateIdeaRoute = async ({ request, bouncer }: HttpContext) => {
  const { text, ideaId, state } = await request.validate({
    schema: ideaSchema,
  })
  const idea = await Idea.findOrFail(ideaId)

  await bouncer.with('ResourcePolicy').authorize('viewUpdateOrDelete', idea, 'IDEAS_ADMIN')

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
