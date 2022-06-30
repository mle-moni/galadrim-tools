import { hasRights } from '@galadrim-rooms/shared/'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from '../../../../Models/Restaurant'

export const destroyRoute = async ({ params, auth, response }: HttpContextContract) => {
    const restaurant = await Restaurant.findOrFail(params.id)
    const user = auth.user!
    if (!hasRights(user.rights, ['MIAM_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }
    await restaurant.delete()
    return { id: restaurant.id, deleted: true }
}
