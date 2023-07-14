import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BreakTime from 'App/Models/BreakTime'

export const breakTimesIndex = async ({}: HttpContextContract) => {
    return BreakTime.all()
}
