import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import IdeaVote from '../../../../Models/IdeaVote'

const ideaSchema = schema.create({
    isUpvote: schema.boolean(),
    ideaId: schema.number([rules.exists({ table: 'ideas', column: 'id' })]),
})

export const createOrUpdateVoteRoute = async ({ auth, request }: HttpContextContract) => {
    const user = auth.user!
    const userId = user.id
    const { isUpvote, ideaId } = await request.validate({
        schema: ideaSchema,
    })

    const ideaVote = await IdeaVote.updateOrCreate({ ideaId, userId }, { ideaId, userId, isUpvote })

    const reaction = isUpvote ? 'aimez' : "n'aimez pas"

    return { message: `Vous ${reaction} cette idée`, ideaVote: ideaVote.frontendData }
}
