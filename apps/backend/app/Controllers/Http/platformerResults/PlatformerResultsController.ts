import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PlatformerResult from '#app/Models/PlatformerResult'

export default class PlatformerResultsController {
    async index({}: HttpContextContract) {
        const results = await PlatformerResult.query()
            .select('id', 'map_id', 'user_id', 'score', 'jumps', 'time')
            .from('platformer_results as p1')
            .whereNotExists((q) => {
                q.select('*')
                    .from('platformer_results as p2')
                    .where('p1.id', '!=', Database.raw('p2.id'))
                    .where('p1.map_id', Database.raw('p2.map_id'))
                    .where('p1.user_id', Database.raw('p2.user_id'))
                    .where('p2.score', '<', Database.raw('p1.score'))
            })

        return results
    }
}
