import { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'

export const usersRoute = async (_params: HttpContext) => {
    const rawUsers = await User.all()
    return rawUsers.map((user) => user.shortData)
}
