import { schema, validator } from '@adonisjs/validator'

const restaurantIdSchema = schema.create({
  restaurantId: schema.number(),
})

export const validateRestaurantId = (data: unknown) => {
  return validator.validate({ schema: restaurantIdSchema, data })
}
