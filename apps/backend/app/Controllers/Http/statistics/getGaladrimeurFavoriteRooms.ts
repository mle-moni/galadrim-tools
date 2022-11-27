import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const getGaladrimeurFavoriteRooms = async ({ request }: HttpContextContract) => {
    const { days } = request.qs()
    const filterQuery = days ? 'WHERE created_at > DATE_SUB(NOW(), INTERVAL ? DAY)' : ''
    const result = await Database.rawQuery(
        `
    SELECT
      room as id,
      room, 
      (SUM(TIME_TO_SEC(TIMEDIFF(end, start)))) as time,
      count(events.id) as amount 
    FROM events 
    ${filterQuery}
    GROUP BY room ORDER BY time DESC;`,
        days ? [days] : undefined
    )
    return result[0]
}
