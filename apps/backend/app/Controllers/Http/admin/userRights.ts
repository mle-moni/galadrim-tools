import { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'

export const userRightsRoute = async ({}: HttpContext) => {
    const users = await User.all()
    return users.map((user) => user.getRightsData())
}
