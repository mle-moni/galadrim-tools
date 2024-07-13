import { hasRights } from '@galadrim-tools/shared/'
import { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#app/Models/Restaurant'
import Ws from '#app/Services/Ws'

export const destroyRoute = async ({ params, auth, response }: HttpContext) => {
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
