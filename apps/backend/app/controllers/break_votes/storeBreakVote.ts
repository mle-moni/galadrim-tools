import BreakActivity from '#models/break_activity'
import BreakTime from '#models/break_time'
import BreakVote from '#models/break_vote'
import BreakVoteActivity from '#models/break_vote_activity'
import BreakVoteTime from '#models/break_vote_time'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { schema } from '@adonisjs/validator'
import { TODAY_BREAK_VOTE_FILTER } from './breakVotesIndex.js'

const breakVoteSchema = schema.create({
  activities: schema.array().members(schema.number()),
  times: schema.array().members(schema.number()),
})

export const storeBreakVote = async ({ auth, request, response }: HttpContext) => {
  const user = auth.user!

  const { activities, times } = await request.validate({ schema: breakVoteSchema })

  const foundTimes = await BreakTime.query().whereIn('id', times)
  if (foundTimes.length !== times.length) {
    return response.badRequest({ error: `L'horaire n'existe pas` })
  }
  const foundActivities = await BreakActivity.query().whereIn('id', activities)
  if (foundActivities.length !== activities.length) {
    return response.badRequest({ error: `L'activité n'existe pas` })
  }

  const trx = await db.transaction()

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
