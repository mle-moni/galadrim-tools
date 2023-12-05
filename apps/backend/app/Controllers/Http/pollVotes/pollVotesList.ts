import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PollVote from 'App/Models/PollVote'
import { validatePollId } from './pollVoteSchema'

export const pollVotesList = async ({ params }: HttpContextContract) => {
    const { pollId } = await validatePollId(params)

    const pollVotes = await PollVote.query()
        .where('poll_id', pollId)
        .preload('pollOption')
        .orderBy('updated_at', 'desc')

    return pollVotes
}
