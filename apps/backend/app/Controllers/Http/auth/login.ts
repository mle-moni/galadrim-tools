import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

const loginSchema = schema.create({
    email: schema.string([rules.trim()]),
    password: schema.string([rules.trim()]),
})

export const loginRoute = async ({ request, auth }: HttpContextContract) => {
    const { email, password } = await request.validate({
        schema: loginSchema,
    })
    const user = await User.findBy('email', email)

    if (user?.otpToken === password) {
        await auth.login(user, true)
        user.otpToken = null
        await user.save()
    } else {
        await auth.attempt(email, password, true)
    }
    return auth.user?.userData()
}
