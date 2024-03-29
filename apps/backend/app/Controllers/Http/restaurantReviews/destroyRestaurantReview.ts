import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantReview from 'App/Models/RestaurantReview'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'
import Ws from 'App/Services/Ws'

export const destroyRestaurantReview = async ({ params, bouncer }: HttpContextContract) => {
    const { id } = await validateResourceId(params)
    const restaurantReview = await RestaurantReview.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', restaurantReview)

    const deletedId = restaurantReview.id

    await restaurantReview.delete()

    Ws.io.to('connectedSockets').emit('deleteRestaurantReview', deletedId)

    return { message: 'Cet avis de restaurant à bien été supprimé', deletedId }
}
