import db from '@adonisjs/lucid/services/db'
import { HttpContext } from '@adonisjs/core/http'

export const getEventsAmountPerGaladrimeurs = async ({ request }: HttpContext) => {
    const { days } = request.qs()
    const filterQuery = days ? 'WHERE events.created_at > DATE_SUB(NOW(), INTERVAL ? DAY)' : ''
    const result = await db.rawQuery(
        `
    SELECT
      count(events.id) as amount,
      users.username,
      users.id 
    FROM events 
    JOIN users ON events.user_id = users.id
    ${filterQuery}
    GROUP BY user_id ORDER BY amount DESC;`,
        days ? [days] : undefined
    )
    return result[0]
}
