import User from '#app/Models/User'
import { generateDistanceRanking } from './generateDistanceRanking'
import { generateRewindForUser } from './generateRewindForUser'
import { generateWealthRanking } from './generateWealthRanking'
import logger from '@adonisjs/core/services/logger'

export const generateRewind = async () => {
    const users = await User.query()
    const [rankingMap, wealthMap] = await Promise.all([
        generateDistanceRanking(),
        generateWealthRanking(),
    ])
    for (const user of users) {
        logger.info(`Generation for user ${user.username}`)
        try {
            await generateRewindForUser(user.id, rankingMap, wealthMap)
        } catch (error) {
            logger.error(error)
            logger.error(`Generation for user ${user.username} failed:`)
        }
    }
}
