import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

const loginSchema = schema.create({
    username: schema.string({ trim: true }),
    password: schema.string({ trim: true }),
})

const checkErrors = async (
    response: HttpContextContract['response'],
    _username: string,
    _password: string
) => {
    // TODO
    response.unauthorized({ error: 'Identifiants incorrects' })
    return null
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
