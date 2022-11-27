import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export const getTimePerGaladrimeurs = async ({ request }: HttpContextContract) => {
    const { days } = request.qs()
    const filterQuery = days ? 'WHERE events.created_at > DATE_SUB(NOW(), INTERVAL ? DAY)' : ''
    const result = await Database.rawQuery(
        `
    SELECT
      (SUM(TIME_TO_SEC(TIMEDIFF(end, start)))) as time,
      users.username,
      users.id
    FROM events 
    JOIN users ON events.user_id = users.id
    ${filterQuery}
    GROUP BY user_id ORDER BY time DESC;`,
        days ? [days] : undefined
    )
    return result[0]
}
