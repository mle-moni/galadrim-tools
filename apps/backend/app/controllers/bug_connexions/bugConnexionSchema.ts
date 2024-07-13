import { schema } from '@adonisjs/validator'

export const bugConnexionSchema = schema.create({
  room: schema.string(),
  networkName: schema.string(),
  details: schema.string.nullable(),
})
