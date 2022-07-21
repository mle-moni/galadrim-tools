import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const meRoute = ({ auth, response }: HttpContextContract) => {
    const userData = auth.user?.userData()

    if (userData === undefined) {
        return response.unauthorized({
            error: `Vous n'êtes pas connecté`,
        })
    }

    return userData
}
