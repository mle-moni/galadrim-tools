import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BugConnexion from 'App/Models/BugConnexion'
import { bugConnexionSchema } from './bugConnexionSchema'

export const storeBugConnexion = async ({ request, auth }: HttpContextContract) => {
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
