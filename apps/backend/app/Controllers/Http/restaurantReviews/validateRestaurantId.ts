import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'

const restaurantIdSchema = schema.create({
    restaurantId: schema.number([rules.exists({ table: 'restaurants', column: 'id' })]),
})

export const validateRestaurantId = (data: unknown) => {
    return validator.validate({ schema: restaurantIdSchema, data })
}
