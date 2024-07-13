import { HttpContext } from '@adonisjs/core/http'
import BreakVote from '#app/Models/BreakVote'

export const TODAY_BREAK_VOTE_FILTER = "DATE_FORMAT(break_votes.created_at, '%Y-%m-%d') = curdate()"

export const breakVotesIndex = async ({}: HttpContext) => {
    return BreakVote.query()
        .whereRaw(TODAY_BREAK_VOTE_FILTER)
        .preload('activities')
        .preload('times')
}
