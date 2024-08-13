import db from "@adonisjs/lucid/services/db";

interface UserRankResult {
    userRank: number | null;
    maxRank: number;
}

export const getRewindRank = async (userId: number): Promise<UserRankResult> => {
    // Requête pour obtenir le user_rank de l'utilisateur spécifique
    const userRankData = await db.rawQuery(
        `
        WITH UserRanks AS (
            SELECT
                u.id,
                COUNT(rc.restaurant_id) AS restaurant_count,
                RANK() OVER (ORDER BY COUNT(rc.restaurant_id) DESC) AS user_rank
            FROM
                restaurant_choices rc
            JOIN
                users u ON u.id = rc.user_id
            GROUP BY
                u.id
        )
        SELECT
            user_rank
        FROM
            UserRanks
        WHERE
            id = ?
    `,
        [userId],
    );

    const userRank =
        userRankData.length > 0 && userRankData[0].length > 0 ? userRankData[0][0].user_rank : null;

    // Requête pour obtenir le rank_max en se basant sur le nombre d'utilisateurs ayant au moins un choix de restaurant
    const rankMaxData = await db
        .from("restaurant_choices")
        .countDistinct("user_id as user_count")
        .first();

    const maxRank = rankMaxData ? rankMaxData.user_count : null;

    return { userRank, maxRank };
};
