import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantRewind from 'App/Models/RestaurantRewind'
import { schema, validator } from '@ioc:Adonis/Core/Validator'

const resourceIdSchema = schema.create({ id: schema.number.optional() })

export const showRestaurantRewind = async ({ params, bouncer, auth }: HttpContextContract) => {
    const { id } = await validator.validate({ schema: resourceIdSchema, data: params })
    const restaurantRewind = await RestaurantRewind.query()
        .where('userId', id ?? auth.user!.id)
        .orderBy('createdAt', 'desc')
        .firstOrFail()

    if (id) {
        await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', restaurantRewind)
    }

    return restaurantRewind
}
