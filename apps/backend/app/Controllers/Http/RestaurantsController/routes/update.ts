import { hasRights } from '@galadrim-rooms/shared'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from '../../../../Models/Restaurant'
import RestaurantTag from '../../../../Models/RestaurantTag'
import Ws from '../../../../Services/Ws'
import { validateRestaurantsParams } from './store'

type PromiseType<T> = T extends Promise<infer U> ? U : never

type RestaurantValidatedInput = PromiseType<ReturnType<typeof validateRestaurantsParams>>

const updateRestaurantScalars = async (restaurant: Restaurant, input: RestaurantValidatedInput) => {
    const { name, description, lat, lng, image } = input

    restaurant.name = name
    restaurant.description = description
    restaurant.lat = lat
    restaurant.lng = lng

    if (image) {
        restaurant.image = Attachment.fromFile(image)
    }

    await restaurant.save()
}

const updateRestaurantTags = async (restaurant: Restaurant, newTags: number[]) => {
    await restaurant.load('tags')

    const tagsSet = new Set(restaurant.tags.map((tag) => tag.id))
    const tagsToCreate = newTags
        .filter((tagId) => !tagsSet.has(tagId))
        .map((tagId) => ({ restaurantId: restaurant.id, tagId }))

    await RestaurantTag.createMany(tagsToCreate)
}

export const updateRoute = async ({ params, request, auth, response }: HttpContextContract) => {
    const restaurant = await Restaurant.findOrFail(params.id)
    const user = auth.user!

    if (!hasRights(user.rights, ['MIAM_ADMIN'])) {
        return response.forbidden({ error: `Vous n'avez pas les droits nécessaires` })
    }

    const input = await validateRestaurantsParams(request)

    await updateRestaurantScalars(restaurant, input)

    await updateRestaurantTags(restaurant, input.tags)

    const restaurantToSend = Restaurant.fetchById(restaurant.id)

    Ws.io.to('connectedSockets').emit('updateRestaurant', restaurantToSend)

    return restaurantToSend
}
