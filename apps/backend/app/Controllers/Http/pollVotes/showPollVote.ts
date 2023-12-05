import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PollVote from 'App/Models/PollVote'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const showPollVote = async ({ params }: HttpContextContract) => {
    const { id } = await validateResourceId(params)

    const pollVote = await PollVote.query().where('id', id).preload('pollOption').firstOrFail()

    return pollVote
}
