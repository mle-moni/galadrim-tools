import db from "@adonisjs/lucid/services/db";
import type { HttpContext } from "@adonisjs/core/http";

export const getGaladrimeurFavoriteRooms = async ({ request }: HttpContext) => {
    const { days } = request.qs();
    const filterQuery = days ? "WHERE created_at > DATE_SUB(NOW(), INTERVAL ? DAY)" : "";
    const result = await db.rawQuery(
        `
    SELECT
      room as id,
      room, 
      (SUM(TIME_TO_SEC(TIMEDIFF(end, start)))) as time,
      count(events.id) as amount 
    FROM events 
    ${filterQuery}
    GROUP BY room ORDER BY time DESC;`,
        days ? [days] : undefined,
    );
    return result[0];
};
