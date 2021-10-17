import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Event from 'App/Models/Event'

const StoreValidationSchema = schema.create({
    title: schema.string({ trim: true }, [rules.maxLength(40), rules.minLength(2)]),
    start: schema.date({}, [rules.beforeField('end')]),
    end: schema.date(),
    room: schema.string({ trim: true }, [rules.maxLength(40), rules.minLength(2)]),
})

export const validateEventsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
    })
}

export const storeRoute = async ({ request }: HttpContextContract) => {
    const { start, end, title, room } = await validateEventsParams(request)
    return Event.create({ start, end, title, room })
}
