import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export const usersRoute = async (_params: HttpContextContract) => {
    const rawUsers = await User.all()
    return rawUsers.map(({ id, username }) => ({ id, username }))
}
