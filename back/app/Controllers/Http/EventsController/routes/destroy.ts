import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const destroyRoute = async ({ params, auth, response }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    const user = auth.user!
    if (event.userId !== user.id) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    await event.delete()
    return { id: event.id, deleted: true }
}
