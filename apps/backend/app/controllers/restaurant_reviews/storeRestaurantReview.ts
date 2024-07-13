import Restaurant from '#models/restaurant'
import RestaurantReview from '#models/restaurant_review'
import { imageAttachmentFromFile } from '#services/attachment'
import { createNotificationForUsers, cropText } from '#services/notifications'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { restaurantReviewSchema } from './restaurantReviewSchema.js'
import { validateRestaurantId } from './validateRestaurantId.js'

export const storeRestaurantReview = async ({ request, auth, params }: HttpContext) => {
  const user = auth.user!
  const { restaurantId } = await validateRestaurantId(params)
  const { comment, image } = await request.validate({
    schema: restaurantReviewSchema,
  })

  const restaurant = await Restaurant.findOrFail(restaurantId)

  const restaurantReview = await RestaurantReview.create({
    restaurantId,
    userId: user.id,
    comment,
    image: image ? imageAttachmentFromFile(image, 'restaurantReviews') : null,
  })

  Ws.io.to('connectedSockets').emit('createRestaurantReview', restaurantReview.toJSON())

  createNotificationForUsers(
    {
      title: 'Nouvel avis de restaurant',
      text: `Avis sur ${cropText(restaurant.name, 20)} par ${user.username}`,
      type: 'NEW_REVIEW',
      link: `/saveur?zoom=18&restaurant-id=${restaurantId}`,
    },
    user.id
  )

  return { message: 'Avis ajouté', restaurantReview }
}
