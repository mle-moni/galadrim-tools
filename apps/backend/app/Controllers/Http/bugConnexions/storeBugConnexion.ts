import { HttpContext } from '@adonisjs/core/http'
import BugConnexion from '#app/Models/BugConnexion'
import { bugConnexionSchema } from './bugConnexionSchema'

export const storeBugConnexion = async ({ request, auth }: HttpContext) => {
    const user = auth.user!
    const { details, networkName, room } = await request.validate({ schema: bugConnexionSchema })

    const bugConnexion = await BugConnexion.create({
        networkName,
        room,
        details,
        userId: user.id,
    })

    return { message: 'BugConnexion created', bugConnexion }
}
