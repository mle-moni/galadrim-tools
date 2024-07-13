import { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'

export const indexRoute = async (_params: HttpContext) => {
    const users = await User.all()
    return users.map((user) => user.username).sort()
}
