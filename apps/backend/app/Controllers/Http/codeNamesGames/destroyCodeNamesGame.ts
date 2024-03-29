import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CodeNamesGame from 'App/Models/CodeNamesGame'
import Ws from 'App/Services/Ws'

export const destroyCodeNamesGame = async ({ auth, params, response }: HttpContextContract) => {
    const user = auth.user!
    const game = await CodeNamesGame.findOrFail(params.id)

    if (user.hasRights(['CODE_NAMES_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }

    const deleletedId = game.id

    await game.delete()

    Ws.io.to('connectedSockets').emit('deleteCodeNamesGame', deleletedId)

    return { message: 'La partie à bien été supprimée' }
}
