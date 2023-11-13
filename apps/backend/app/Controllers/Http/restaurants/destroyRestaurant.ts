import { hasRights } from '@galadrim-tools/shared/'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from 'App/Models/Restaurant'
import Ws from 'App/Services/Ws'

export const destroyRoute = async ({ params, auth, response }: HttpContextContract) => {
    const restaurant = await Restaurant.findOrFail(params.id)

    const user = auth.user!
    if (!hasRights(user.rights, ['MIAM_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }

    await restaurant.load((builder) =>
        builder.preload('tags').preload('notes').preload('choices').preload('reviews')
    )
    const eventJson = restaurant.frontendData
    await restaurant.delete()

    Ws.io.to('connectedSockets').emit('deleteRestaurant', eventJson)
    return { id: restaurant.id, deleted: true }
}
