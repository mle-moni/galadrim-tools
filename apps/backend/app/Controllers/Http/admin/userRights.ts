import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '#app/Models/User'

export const userRightsRoute = async ({}: HttpContextContract) => {
    const users = await User.all()
    return users.map((user) => user.getRightsData())
}
