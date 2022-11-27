import { hasRights } from '@galadrim-tools/shared/'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from 'App/Models/Tag'
import Ws from 'App/Services/Ws'

export const destroyRoute = async ({ params, auth, response }: HttpContextContract) => {
    const tag = await Tag.findOrFail(params.id)
    const user = auth.user!
    if (!hasRights(user.rights, ['MIAM_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    const eventJson = tag.toJSON()
    await tag.delete()
    Ws.io.to('connectedSockets').emit('deleteTag', eventJson)
    return { id: tag.id, deleted: true }
}
