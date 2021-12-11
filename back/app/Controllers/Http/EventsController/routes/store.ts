import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Event from 'App/Models/Event'

const StoreValidationSchema = schema.create({
    start: schema.date({}, [rules.beforeField('end')]),
    end: schema.date(),
    room: schema.string({ trim: true }, [rules.maxLength(40), rules.minLength(2)]),
})

export const validateEventsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
    })
}

export const storeRoute = async ({ request, auth }: HttpContextContract) => {
    const { start, end, room } = await validateEventsParams(request)
    const user = auth.user!
    return Event.create({ start, end, title: user.username, room, userId: user.id })
}
