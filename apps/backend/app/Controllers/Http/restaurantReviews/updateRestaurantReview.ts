import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContext } from '@adonisjs/core/http'
import RestaurantReview from '#app/Models/RestaurantReview'
import { validateResourceId } from '#app/Scaffolder/validateResourceId'
import Ws from '#app/Services/Ws'
import { restaurantReviewSchema } from './restaurantReviewSchema'

export const updateRestaurantReview = async ({ params, request, bouncer }: HttpContext) => {
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
