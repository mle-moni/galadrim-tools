import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import BreakVote from 'App/Models/BreakVote'
import BreakVoteActivity from 'App/Models/BreakVoteActivity'
import BreakVoteTime from 'App/Models/BreakVoteTime'

const breakVoteSchema = schema.create({
    activities: schema
        .array()
        .members(schema.number([rules.exists({ table: 'break_activities', column: 'id' })])),
    times: schema.array().members(schema.string([rules.regex(/^[0-9]{2}:[0-9]{2}$/)])),
})

export const storeBreakVote = async ({ auth, request }: HttpContextContract) => {
    const user = auth.user!

    const { activities, times } = await request.validate({ schema: breakVoteSchema })

    const trx = await Database.transaction()

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
            times.map((time) => ({
                breakVoteId: newBreakVote.id,
                time,
            })),
            { client: trx }
        )

        await trx.commit()
    } catch (error) {
        await trx.rollback()
        throw error
    }
}
