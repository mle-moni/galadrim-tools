import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export const createApiTokenRoute = async ({ auth }: HttpContext) => {
  const token = await User.accessTokens.create(auth.user!)

  return token
}
