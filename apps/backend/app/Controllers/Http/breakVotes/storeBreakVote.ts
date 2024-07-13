import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { TODAY_BREAK_VOTE_FILTER } from '#app/Controllers/Http/breakVotes/breakVotesIndex'
import BreakVote from '#app/Models/BreakVote'
import BreakVoteActivity from '#app/Models/BreakVoteActivity'
import BreakVoteTime from '#app/Models/BreakVoteTime'

const breakVoteSchema = schema.create({
    activities: schema
        .array()
        .members(schema.number([rules.exists({ table: 'break_activities', column: 'id' })])),
    times: schema
        .array()
        .members(schema.number([rules.exists({ table: 'break_times', column: 'id' })])),
})

export const storeBreakVote = async ({ auth, request }: HttpContextContract) => {
    const user = auth.user!

    const { activities, times } = await request.validate({ schema: breakVoteSchema })

    const trx = await Database.transaction()

    await BreakVote.query({ client: trx })
        .where('user_id', user.id)
        .andWhereRaw(TODAY_BREAK_VOTE_FILTER)
        .delete()

    try {
        const newBreakVote = await BreakVote.create({ userId: user.id }, { client: trx })

        await BreakVoteActivity.createMany(
            activities.map((activityId) => ({
                breakVoteId: newBreakVote.id,
                breakActivityId: activityId,
            })),
            { client: trx }
        )

        await BreakVoteTime.createMany(
            times.map((timeId) => ({
                breakVoteId: newBreakVote.id,
                breakTimeId: timeId,
            })),
            { client: trx }
        )

        await trx.commit()

        return { message: 'Vote pris en compte' }
    } catch (error) {
        await trx.rollback()
        throw error
    }
}
