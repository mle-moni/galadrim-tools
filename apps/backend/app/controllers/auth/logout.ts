import { HttpContext } from '@adonisjs/core/http'

export const logoutRoute = async ({ auth, response }: HttpContext) => {
    if (!auth.user) {
        return response.badRequest({ error: `Vous n'êtes pas connecté` })
    }
    await auth.logout()
    return { notification: 'Vous êtes bien déconnecté' }
}
