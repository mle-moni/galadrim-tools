import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakVote from 'App/Models/BreakVote'

export const TODAY_BREAK_VOTE_FILTER = "DATE_FORMAT(break_votes.created_at, '%Y-%m-%d') = curdate()"

export const breakVotesIndex = async ({}: HttpContextContract) => {
    return BreakVote.query()
        .whereRaw(TODAY_BREAK_VOTE_FILTER)
        .preload('activities')
        .preload('times')
}
