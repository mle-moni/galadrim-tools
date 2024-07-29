import RestaurantRewind from '#models/restaurant_rewind'
import { HttpContext } from '@adonisjs/core/http'
import { schema, validator } from '@adonisjs/validator'

const resourceIdSchema = schema.create({ id: schema.number.optional() })

export const showRestaurantRewind = async ({ params, bouncer, auth }: HttpContext) => {
  const { id } = await validator.validate({ schema: resourceIdSchema, data: params })
  const restaurantRewind = await RestaurantRewind.query()
    .where('userId', id ?? auth.user!.id)
    .orderBy('createdAt', 'desc')
    .firstOrFail()

  if (id) {
    await bouncer
      .with('ResourcePolicy')
      .authorize('viewUpdateOrDelete', restaurantRewind, 'MIAM_ADMIN')
  }

  return restaurantRewind
}
