import User from 'App/Models/User'
import { generateDistanceRanking } from './generateDistanceRanking'
import { generateRewindForUser } from './generateRewindForUser'
import { generateWealthRanking } from './generateWealthRanking'
import Logger from '@ioc:Adonis/Core/Logger'

export const generateRewind = async () => {
    const users = await User.query()
    const [rankingMap, wealthMap] = await Promise.all([
        generateDistanceRanking(),
        generateWealthRanking(),
    ])
    for (const user of users) {
        Logger.info(`Generation for user ${user.username}`)
        try {
            await generateRewindForUser(user.id, rankingMap, wealthMap)
        } catch (error) {
            Logger.error(error)
            Logger.error(`Generation for user ${user.username} failed:`)
        }
    }
}
