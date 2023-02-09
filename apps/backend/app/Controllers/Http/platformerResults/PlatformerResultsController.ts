import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PlatformerResult from 'App/Models/PlatformerResult'

export default class PlatformerResultsController {
    async index({}: HttpContextContract) {
        const results = await PlatformerResult.query()
            .select('id', 'map_id', 'user_id', 'score', 'jumps', 'time')
            .from('platformer_results')
            .whereIn(Database.raw('(map_id, user_id, score)'), (builder) => {
                builder
                    .select('map_id', 'user_id', Database.raw('MIN(score)'))
                    .from('platformer_results')
                    .groupBy('map_id', 'user_id')
            })
            .groupBy('map_id', 'user_id')

        return results
    }
}
