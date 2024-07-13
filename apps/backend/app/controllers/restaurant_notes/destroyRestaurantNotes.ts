import { HttpContext } from '@adonisjs/core/http'

export const destroyRoute = async ({ response }: HttpContext) => {
  return response.notImplemented({ error: `Cette fonctionnalité n'est pas implémentée` })
}
