import BreakTime from '#models/break_time'
import { HttpContext } from '@adonisjs/core/http'

export const breakTimesIndex = async ({}: HttpContext) => {
  return BreakTime.all()
}
