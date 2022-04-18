import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { nanoid } from 'nanoid'

const loginSchema = schema.create({
    email: schema.string({ trim: true }),
})

// generate one time password for user and send it in email
export const getOtpRoute = async ({ request, response }: HttpContextContract) => {
    const { email } = await request.validate({
        schema: loginSchema,
    })
    const user = await User.findBy('email', email)
    if (user === null) {
        return response.badRequest({ error: `Utilisateur introuvable` })
    }
    user.otpToken = nanoid()
    await user.save()
    // TODO send email
    return { notification: 'Un email vous a été envoyé' }
}
