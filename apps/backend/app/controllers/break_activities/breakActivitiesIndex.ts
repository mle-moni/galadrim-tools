import BreakActivity from '#models/break_activity'
import { HttpContext } from '@adonisjs/core/http'

export const breakActivitiesIndex = async ({}: HttpContext) => {
  return BreakActivity.all()
}
