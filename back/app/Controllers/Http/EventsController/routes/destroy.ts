import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'

export const destroyRoute = async ({ params }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    await event.delete()
    return { id: event.id, deleted: true }
}
