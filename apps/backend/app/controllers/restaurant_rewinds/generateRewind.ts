import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import { generateDistanceRanking } from './generateDistanceRanking.js'
import { generateRewindForUser } from './generateRewindForUser.js'
import { generateWealthRanking } from './generateWealthRanking.js'

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
