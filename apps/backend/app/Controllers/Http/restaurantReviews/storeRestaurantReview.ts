import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateRestaurantId } from 'App/Controllers/Http/restaurantReviews/validateRestaurantId'
import Restaurant from 'App/Models/Restaurant'
import RestaurantReview from 'App/Models/RestaurantReview'
import Ws from 'App/Services/Ws'
import { createNotificationForUsers, cropText } from 'App/Services/notifications'
import { restaurantReviewSchema } from './restaurantReviewSchema'

export const storeRestaurantReview = async ({ request, auth, params }: HttpContextContract) => {
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
            title: 'Nouvelle idée dans la boîte à idée',
            text: `Nouvel avis sur ${cropText(restaurant.name, 20)} par ${user.username}`,
            type: 'NEW_REVIEW',
            link: `/saveur?zoom=18&restaurant-id=${restaurantId}`,
        },
        user.id
    )

    return { message: 'Avis ajouté', restaurantReview }
}
