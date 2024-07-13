import Tag from '#models/tag'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'

const StoreValidationSchema = schema.create({
  name: schema.string([rules.trim(), rules.maxLength(20), rules.minLength(2)]),
})

export const validateTagsParams = async (request: HttpContext['request']) => {
  return request.validate({
    schema: StoreValidationSchema,
    messages: {
      'name.required': "Le champ 'tag' est obligatoire",
      'name.maxLength': 'Le tag est trop long',
      'name.minLength': 'Le tag est trop court',
    },
  })
}

export const storeRoute = async ({ request, response }: HttpContext) => {
  const { name } = await validateTagsParams(request)
  const found = await Tag.query().whereILike('name', name).first()

  if (found) {
    return response.badRequest({ error: 'Ce tag existe déjà' })
  }

  const event = await Tag.create({ name })
  Ws.io.to('connectedSockets').emit('createTag', event)
  return event
}
