import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from 'App/Models/Event'
import { validateEventsParams } from './store'

export const updateRoute = async ({ params, request }: HttpContextContract) => {
    const event = await Event.findOrFail(params.id)
    const { title, start, end, room } = await validateEventsParams(request)
    event.title = title
    event.start = start
    event.end = end
    event.room = room
    await event.save()
    return event
}
