import PlatformerResult from '#models/platformer_result'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PlatformerResultsController {
  async index({}: HttpContext) {
    const results = await PlatformerResult.query()
      .select('id', 'map_id', 'user_id', 'score', 'jumps', 'time')
      .from('platformer_results as p1')
      .whereNotExists((q) => {
        q.select('*')
          .from('platformer_results as p2')
          .where('p1.id', '!=', db.raw('p2.id'))
          .where('p1.map_id', db.raw('p2.map_id'))
          .where('p1.user_id', db.raw('p2.user_id'))
          .where('p2.score', '<', db.raw('p1.score'))
      })

    return results
  }
}
