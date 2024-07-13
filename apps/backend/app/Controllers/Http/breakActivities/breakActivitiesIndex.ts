import { HttpContext } from '@adonisjs/core/http'
import BreakActivity from '#app/Models/BreakActivity'

export const breakActivitiesIndex = async ({}: HttpContext) => {
    return BreakActivity.all()
}
