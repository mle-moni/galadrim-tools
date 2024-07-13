import BreakVote from '#models/break_vote'
import { HttpContext } from '@adonisjs/core/http'

export const TODAY_BREAK_VOTE_FILTER = "DATE_FORMAT(break_votes.created_at, '%Y-%m-%d') = curdate()"

export const breakVotesIndex = async ({}: HttpContext) => {
  return BreakVote.query().whereRaw(TODAY_BREAK_VOTE_FILTER).preload('activities').preload('times')
}
