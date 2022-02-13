import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { getForestUsers } from 'Database/forest/requests/users'

const loginSchema = schema.create({
    username: schema.string({ trim: true }),
    password: schema.string({ trim: true }),
})

const checkErrors = async (
    response: HttpContextContract['response'],
    username: string,
    password: string
) => {
    const allUsers = await getForestUsers()
    const forestUser = allUsers.find((user) => user.Username === username)
    if (!forestUser) {
        response.badRequest({ error: 'utilisateur inconnu' })
        return null
    }
    if (forestUser.Password !== password) {
        response.unauthorized({ error: 'Identifiants incorrects' })
        return null
    }
    return forestUser
}

export const loginRoute = async ({ request, auth, response }: HttpContextContract) => {
    const { username, password } = await request.validate({
        schema: loginSchema,
    })
    const forestUser = await checkErrors(response, username, password)
    if (!forestUser) return
    const user = await User.findBy('username', username)
    if (user) {
        await auth.login(user, true)
        return user.publicData()
    }
    const newUser = await User.create({ username, password })
    await auth.login(newUser, true)
    return newUser.publicData()
}
