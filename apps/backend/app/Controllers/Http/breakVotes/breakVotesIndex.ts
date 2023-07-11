import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakVote from 'App/Models/BreakVote'

export const breakVotesIndex = async ({}: HttpContextContract) => {
    return BreakVote.query().preload('activities')
}
