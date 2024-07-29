import User from '#models/user'
import env from '#start/env'
import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { rules, schema } from '@adonisjs/validator'
import { nanoid } from 'nanoid'

const loginSchema = schema.create({
  email: schema.string([rules.trim()]),
})

// generate one time password for user and send it in email
export const getOtpRoute = async ({ request, response }: HttpContext) => {
  const { email } = await request.validate({
    schema: loginSchema,
  })
  const user = await User.findBy('email', email)
  if (user === null) {
    return response.badRequest({ error: `Utilisateur introuvable` })
  }
  user.otpToken = nanoid()
  await user.save()
  await mail.use('mailgun').send((message) => {
    message
      .from(`<noreply@${env.get('MAILGUN_DOMAIN')}>`)
      .to(user.email)
      .subject('Mot de passe oublié')
      .htmlView('emails/get_otp', {
        username: user.username,
        otp: user.otpToken,
      })
  })
  return { notification: 'Un email vous a été envoyé' }
}
