import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '#app/Models/User'

export const indexRoute = async (_params: HttpContextContract) => {
    const users = await User.all()
    return users.map((user) => user.username).sort()
}
