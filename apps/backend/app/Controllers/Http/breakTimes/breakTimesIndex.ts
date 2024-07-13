import { HttpContext } from '@adonisjs/core/http'
import BreakTime from '#app/Models/BreakTime'

export const breakTimesIndex = async ({}: HttpContext) => {
    return BreakTime.all()
}
