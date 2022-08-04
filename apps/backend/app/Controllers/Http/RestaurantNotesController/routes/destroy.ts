import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const destroyRoute = async ({ response }: HttpContextContract) => {
    return response.notImplemented({ error: `Cette fonctionnalité n'est pas implémentée` })
}
