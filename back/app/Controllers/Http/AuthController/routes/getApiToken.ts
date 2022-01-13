import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const createApiTokenRoute = async ({ auth, response }: HttpContextContract) => {
    if (!auth.user) {
        return response.badRequest({ error: `Vous n'êtes pas connecté` })
    }
    return auth.use('api').generate(auth.user)
}
