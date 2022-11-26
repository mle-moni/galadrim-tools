import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { nanoid } from 'nanoid'

const loginSchema = schema.create({
    email: schema.string([rules.trim()]),
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
    await Mail.use('mailgun').send((message) => {
        message
            .from(`<noreply@${Env.get('MAILGUN_DOMAIN')}>`)
            .to(user.email)
            .subject('Mot de passe oublié')
            .htmlView('emails/get_otp', {
                username: user.username,
                otp: user.otpToken,
            })
    })
    return { notification: 'Un email vous a été envoyé' }
}
