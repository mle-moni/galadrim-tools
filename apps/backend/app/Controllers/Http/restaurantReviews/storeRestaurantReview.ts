import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContext } from '@adonisjs/core/http'
import { validateRestaurantId } from '#app/Controllers/Http/restaurantReviews/validateRestaurantId'
import Restaurant from '#app/Models/Restaurant'
import RestaurantReview from '#app/Models/RestaurantReview'
import Ws from '#app/Services/Ws'
import { createNotificationForUsers, cropText } from '#app/Services/notifications'
import { restaurantReviewSchema } from './restaurantReviewSchema'

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
        image: image ? Attachment.fromFile(image) : null,
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
