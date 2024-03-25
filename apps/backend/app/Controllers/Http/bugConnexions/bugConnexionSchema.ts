import { schema } from '@ioc:Adonis/Core/Validator'

export const bugConnexionSchema = schema.create({
    room: schema.string(),
    networkName: schema.string(),
    details: schema.string.nullable(),
})
