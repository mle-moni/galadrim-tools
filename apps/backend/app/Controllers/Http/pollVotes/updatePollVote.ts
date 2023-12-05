import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { storePollVote } from './storePollVote'

export const updatePollVote = async (ctx: HttpContextContract) => {
    return storePollVote(ctx)
}
