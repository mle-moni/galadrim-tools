import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Tag from '../../../../Models/Tag'
import Ws from '../../../../Services/Ws'

const StoreValidationSchema = schema.create({
    name: schema.string([
        rules.trim(),
        rules.maxLength(20),
        rules.minLength(2),
        rules.unique({ table: 'tags', column: 'name', caseInsensitive: true }),
    ]),
})

export const validateTagsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
        messages: {
            'name.required': "Le champ 'tag' est obligatoire",
            'name.maxLength': 'Le tag est trop long',
            'name.minLength': 'Le tag est trop court',
            'name.unique': 'Ce tag existe déjà',
        },
    })
}

export const storeRoute = async ({ request }: HttpContextContract) => {
    const { name } = await validateTagsParams(request)
    const event = await Tag.create({ name })
    Ws.io.to('connectedSockets').emit('createTag', event)
    return event
}
