import db from '@adonisjs/lucid/services/db'
import { PARIS_COORDINATES_VALUES } from '@galadrim-tools/shared'

type DistanceRanking = {
    user_id: number
    average_distance: number
    amount: number
    username: string
}

export const generateDistanceRanking = async () => {
    const [distanceRankings]: [DistanceRanking[]] = await db.rawQuery(
        `
  SELECT
  user_id, sum(distance_m)/count(*) as average_distance, count(*) as amount, u.username
FROM
  (
    SELECT
      lng,
      lat,
      rc.user_id,
      (
        6371 * 1000 * acos(
          cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(lat))
        )
      ) AS distance_m
    FROM
      restaurant_choices as rc
      LEFT JOIN restaurants r ON r.id = rc.restaurant_id
  ) AS subquery
  LEFT JOIN users u ON u.id = subquery.user_id
WHERE
  distance_m < 10000
GROUP BY user_id
HAVING amount > 5
ORDER BY average_distance DESC;
  `,
        {
            lat: PARIS_COORDINATES_VALUES[0],
            lng: PARIS_COORDINATES_VALUES[1],
        }
    )

    const distanceRankingMap = new Map<number, number>(
        distanceRankings.map((ranking, index) => [ranking.user_id, index + 1])
    )
    return distanceRankingMap
}
