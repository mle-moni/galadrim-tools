import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantReview from 'App/Models/RestaurantReview'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'
import Ws from 'App/Services/Ws'
import { restaurantReviewSchema } from './restaurantReviewSchema'

export const updateRestaurantReview = async ({ params, request, bouncer }: HttpContextContract) => {
    const { id } = await validateResourceId(params)
    const { comment, image } = await request.validate({
        schema: restaurantReviewSchema,
    })

    const restaurantReview = await RestaurantReview.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', restaurantReview)

    restaurantReview.comment = comment
    if (image) {
        restaurantReview.image = Attachment.fromFile(image)
    }

    await restaurantReview.save()

    Ws.io.to('connectedSockets').emit('updateRestaurantReview', restaurantReview.toJSON())

    return { message: 'RestaurantReview updated', updatedRestaurantReview: restaurantReview }
}
