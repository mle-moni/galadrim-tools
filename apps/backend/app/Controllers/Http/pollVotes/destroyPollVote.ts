import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PollVote from 'App/Models/PollVote'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const destroyPollVote = async ({ params, bouncer }: HttpContextContract) => {
    const { id } = await validateResourceId(params)
    const pollVote = await PollVote.findOrFail(id)

    await bouncer.with('PollPolicy').authorize('isOwner', pollVote)

    const deletedId = pollVote.id

    await pollVote.delete()

    return { message: 'Vote supprimé', deletedId }
}
