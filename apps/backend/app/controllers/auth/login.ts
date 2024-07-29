import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'

const loginSchema = schema.create({
  email: schema.string([rules.trim()]),
  password: schema.string([rules.trim()]),
})

export const loginRoute = async ({ request, auth }: HttpContext) => {
  const { email, password } = await request.validate({
    schema: loginSchema,
  })
  const user = await User.findByOrFail('email', email)

  if (user.otpToken === password) {
    await auth.use('web').login(user, true)
    user.otpToken = null
    await user.save()
  } else {
    await User.verifyCredentials(email, password)
    await auth.use('web').login(user, true)
  }

  await user.load('notifications')
  return user.userData()
}
