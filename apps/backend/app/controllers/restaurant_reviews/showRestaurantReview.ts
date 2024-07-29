import RestaurantReview from '#models/restaurant_review'
import { HttpContext } from '@adonisjs/core/http'
import { validateResourceId } from '../../helpers/validate_resource_id.js'

export const showRestaurantReview = async ({ params, bouncer }: HttpContext) => {
  const { id } = await validateResourceId(params)

  const restaurantReview = await RestaurantReview.findOrFail(id)

  await bouncer
    .with('ResourcePolicy')
    .authorize('viewUpdateOrDelete', restaurantReview, 'MIAM_ADMIN')

  return restaurantReview
}
