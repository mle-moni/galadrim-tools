import { schema, validator } from '@adonisjs/validator'

const resourceIdSchema = schema.create({ id: schema.number() })

export const validateResourceId = (data: unknown) => {
    return validator.validate({ schema: resourceIdSchema, data })
}
