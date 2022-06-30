import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Tag from '../../../../Models/Tag'
import Ws from '../../../../Services/Ws'

const StoreValidationSchema = schema.create({
    name: schema.string([rules.trim(), rules.maxLength(20), rules.minLength(2)]),
})

export const validateTagsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
    })
}

export const storeRoute = async ({ request }: HttpContextContract) => {
    const { name } = await validateTagsParams(request)
    const event = await Tag.create({ name })
    Ws.io.to('connectedSockets').emit('createTag', event)
    return event
}
