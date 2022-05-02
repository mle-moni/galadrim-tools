import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const createApiTokenRoute = async ({ auth }: HttpContextContract) => {
    return auth.use('api').generate(auth.user!)
}
