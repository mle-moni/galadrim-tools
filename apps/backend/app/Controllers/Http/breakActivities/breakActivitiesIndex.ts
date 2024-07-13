import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakActivity from '#app/Models/BreakActivity'

export const breakActivitiesIndex = async ({}: HttpContextContract) => {
    return BreakActivity.all()
}
