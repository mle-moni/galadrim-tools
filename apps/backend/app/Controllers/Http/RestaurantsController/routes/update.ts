import { hasRights } from '@galadrim-rooms/shared'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from '../../../../Models/Restaurant'
import Ws from '../../../../Services/Ws'
import { validateRestaurantsParams } from './store'

type PromiseType<T> = T extends Promise<infer U> ? U : never

const updateRestaurantScalars = async (
    restaurant: Restaurant,
    input: PromiseType<ReturnType<typeof validateRestaurantsParams>>
) => {
    const { name, description, lat, lng } = input

    restaurant.name = name
    restaurant.description = description
    restaurant.lat = lat
    restaurant.lng = lng

    await restaurant.save()
}

const updateRestaurantTags = async (restaurant: Restaurant, newTags: number[]) => {
    await restaurant.load('tags')

    const tagsSet = new Set(restaurant.tags.map((tag) => tag.id))
    const tagsToCreate = newTags
        .filter((tagId) => !tagsSet.has(tagId))
        .map((id) => ({
            id,
        }))

    await restaurant.related('tags').createMany(tagsToCreate)
}

export const updateRoute = async ({ params, request, auth, response }: HttpContextContract) => {
    const restaurant = await Restaurant.findOrFail(params.id)
    const user = auth.user!

    if (!hasRights(user.rights, ['EVENT_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }

    const input = await validateRestaurantsParams(request)

    await updateRestaurantScalars(restaurant, input)

    await updateRestaurantTags(restaurant, input.tags)

    Ws.io.to('connectedSockets').emit('updateRestaurant', restaurant)
    return restaurant
}
