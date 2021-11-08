import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getForestUsers } from 'Database/forest/requests/users'

export const indexRoute = async (_params: HttpContextContract) => {
    const rawUsers = await getForestUsers()
    return rawUsers.map((user) => user.Username).sort()
}
