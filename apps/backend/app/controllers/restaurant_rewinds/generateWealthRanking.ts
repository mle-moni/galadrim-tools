import db from "@adonisjs/lucid/services/db";

type WealthRanking = {
    user_id: number;
    numberOfChoices: number;
    totalSpend: number;
    averageSpent: number;
    username: string;
};

export const generateWealthRanking = async () => {
    const [wealthRankings]: [WealthRanking[]] = await db.rawQuery(
        `
        SELECT
        rc.user_id,
        count(*) as numberOfChoices,
        SUM(r.average_price) as totalSpent,
        SUM(r.average_price)/count(*) as averageSpent,
        u.username
      FROM
        restaurant_choices as rc
      LEFT JOIN users u ON u.id = rc.user_id
      LEFT JOIN restaurants AS r ON r.id = rc.restaurant_id
      GROUP BY
        user_id
      HAVING
        numberOfChoices > 5
      ORDER BY averageSpent DESC;
  `,
    );
    const wealthRankingMap = new Map<number, number>(
        wealthRankings.map((ranking, index) => [ranking.user_id, index + 1]),
    );
    return wealthRankingMap;
};
