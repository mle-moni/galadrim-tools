import { HttpContext } from '@adonisjs/core/http'
import CodeNamesGame from '#app/Models/CodeNamesGame'
import Ws from '#app/Services/Ws'

export const destroyCodeNamesGame = async ({ auth, params, response }: HttpContext) => {
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
