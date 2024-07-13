import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakTime from '#app/Models/BreakTime'

export const breakTimesIndex = async ({}: HttpContextContract) => {
    return BreakTime.all()
}
