import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const logoutRoute = async ({ auth, response }: HttpContextContract) => {
    if (!auth.user) {
        return response.badRequest({ error: `Vous n'êtes pas connecté` })
    }
    await auth.logout()
    return { notification: 'Vous êtes bien déconnecté' }
}
