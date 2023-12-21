import Database from '@ioc:Adonis/Lucid/Database'

interface UserRankResult {
    userRank: number | null
    maxRank: number
}

export const getRewindRank = async (userId: number): Promise<UserRankResult> => {
    // Requête pour obtenir le user_rank de l'utilisateur spécifique
    const userRankData = await Database.from('restaurant_choices')
        .join('users', 'users.id', 'restaurant_choices.user_id')
        .select('users.id')
        .count('restaurant_choices.restaurant_id as restaurant_count')
        .groupBy('users.id')
        .orderBy('restaurant_count', 'desc')
        .select(
            Database.raw(
                'RANK() OVER (ORDER BY COUNT(restaurant_choices.restaurant_id) DESC) as user_rank'
            )
        )
        .where('users.id', userId)
        .first()

    const userRank = userRankData ? userRankData.user_rank : null

    // Requête pour obtenir le rank_max en se basant sur le nombre d'utilisateurs ayant au moins un choix de restaurant
    const rankMaxData = await Database.from('restaurant_choices')
        .countDistinct('user_id as user_count')
        .first()

    const maxRank = rankMaxData ? rankMaxData.user_count : null

    return { userRank, maxRank }
}
