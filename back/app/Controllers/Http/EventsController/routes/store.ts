import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Event from 'App/Models/Event'
import Ws from 'App/Services/Ws'

const StoreValidationSchema = schema.create({
    start: schema.date({}, [rules.beforeField('end')]),
    end: schema.date(),
    room: schema.string({ trim: true }, [rules.maxLength(40), rules.minLength(2)]),
    title: schema.string.optional({ trim: true }, [rules.maxLength(40), rules.minLength(2)]),
})

export const validateEventsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
    })
}

export const storeRoute = async ({ request, auth }: HttpContextContract) => {
    const { start, end, room, title } = await validateEventsParams(request)
    const user = auth.user!
    const event = await Event.create({
        start,
        end,
        title: title || user.username,
        room,
        userId: user.id,
    })
    Ws.io.to('connectedSockets').emit('createEvent', event)
    return event
}
