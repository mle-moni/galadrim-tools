import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PollOption from 'App/Models/PollOption'
import PollVote from 'App/Models/PollVote'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { pollVoteSchema, validatePollId } from './pollVoteSchema'

interface StoreWithNewOptionParams {
    ctx: HttpContextContract
    user: User
    pollId: number
    optionDate?: DateTime
    optionText?: string
    optionType: 'date' | 'text'
}

const storeWithNewOption = async ({
    user,
    optionType,
    pollId,
    optionDate,
    optionText,
    ctx,
}: StoreWithNewOptionParams) => {
    const userId = user.id
    if ((optionType === 'date' && !optionDate) || (optionType === 'text' && !optionText)) {
        return ctx.response.badRequest({
            message: `Option manquante pour option de type ${optionType}`,
        })
    }

    const trx = await Database.transaction()

    try {
        const pollOption = await PollOption.updateOrCreate(
            { userId, pollId },
            {
                userId,
                pollId,
                optionDate,
                optionText,
                optionType,
            },
            { client: trx }
        )
        const pollVote = await PollVote.updateOrCreate(
            { userId, pollId },
            { userId, pollId, pollOptionId: pollOption.id },
            { client: trx }
        )

        await pollVote.load('pollOption')

        return { message: 'PollVote created', pollVote }
    } catch (error) {
        await trx.rollback()

        throw error
    }
}

export const storePollVote = async (ctx: HttpContextContract) => {
    const { request, response, params, auth } = ctx
    const user = auth.user!
    const userId = user.id
    const { pollId } = await validatePollId(params)
    const { optionDate, optionText, optionType, pollOptionId } = await request.validate({
        schema: pollVoteSchema,
    })

    if (optionType) {
        return storeWithNewOption({ user, pollId, optionDate, optionText, optionType, ctx })
    }

    if (!pollOptionId) {
        return response.badRequest({ message: 'Option manquante' })
    }

    const pollVote = await PollVote.updateOrCreate(
        { userId, pollId },
        { userId, pollId, pollOptionId }
    )

    await pollVote.load('pollOption')

    return { message: 'Vote créé', pollVote }
}
