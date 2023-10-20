import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const meRoute = async ({ auth, response }: HttpContextContract) => {
    const user = auth.user

    if (user === undefined) {
        return response.unauthorized({
            error: `Vous n'êtes pas connecté`,
        })
    }

    await user.load((q) => q.preload('notifications').preload('theme'))

    const userData = user.userData()

    return userData
}
