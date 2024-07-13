import { HttpContext } from '@adonisjs/core/http'

export const createApiTokenRoute = async ({ auth }: HttpContext) => {
  return auth.use('api').generate(auth.user!)
}
