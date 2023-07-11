import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakVote from 'App/Models/BreakVote'

export const breakVotesIndex = async ({}: HttpContextContract) => {
    return BreakVote.query()
        .whereRaw(`DATE_FORMAT(break_votes.created_at, '%Y-%m-%d') = curdate()`)
        .preload('activities')
}
