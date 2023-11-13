import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateRestaurantId } from 'App/Controllers/Http/restaurantReviews/validateRestaurantId'
import RestaurantReview from 'App/Models/RestaurantReview'
import Ws from 'App/Services/Ws'
import { restaurantReviewSchema } from './restaurantReviewSchema'

export const storeRestaurantReview = async ({ request, auth, params }: HttpContextContract) => {
    const user = auth.user!
    const { restaurantId } = await validateRestaurantId(params)
    const { comment, image } = await request.validate({
        schema: restaurantReviewSchema,
    })

    const restaurantReview = await RestaurantReview.create({
        restaurantId,
        userId: user.id,
        comment,
        image: image ? Attachment.fromFile(image) : null,
    })

    Ws.io.to('connectedSockets').emit('createRestaurantReview', restaurantReview.toJSON())

    return { message: 'Avis ajouté', restaurantReview }
}
