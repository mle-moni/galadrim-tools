import RestaurantReview from '#models/restaurant_review'
import { imageAttachmentFromFile } from '#services/attachment'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { validateResourceId } from '../../helpers/validate_resource_id.js'
import { restaurantReviewSchema } from './restaurantReviewSchema.js'

export const updateRestaurantReview = async ({ params, request, bouncer }: HttpContext) => {
  const { id } = await validateResourceId(params)
  const { comment, image } = await request.validate({
    schema: restaurantReviewSchema,
  })

  const restaurantReview = await RestaurantReview.findOrFail(id)

  await bouncer
    .with('ResourcePolicy')
    .authorize('viewUpdateOrDelete', restaurantReview, 'MIAM_ADMIN')

  restaurantReview.comment = comment
  if (image) {
    restaurantReview.image = imageAttachmentFromFile(image, 'restaurantReviews')
  }

  await restaurantReview.save()

  Ws.io.to('connectedSockets').emit('updateRestaurantReview', restaurantReview.toJSON())

  return { message: 'RestaurantReview updated', updatedRestaurantReview: restaurantReview }
}
