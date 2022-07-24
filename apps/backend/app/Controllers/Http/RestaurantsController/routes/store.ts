import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Restaurant from '../../../../Models/Restaurant'
import RestaurantTag from '../../../../Models/RestaurantTag'
import Ws from '../../../../Services/Ws'

const StoreValidationSchema = schema.create({
    name: schema.string([rules.trim(), rules.maxLength(20), rules.minLength(2)]),
    description: schema.string([rules.trim(), rules.maxLength(40), rules.minLength(2)]),
    lat: schema.number(),
    lng: schema.number(),
    tags: schema.array().members(schema.number([rules.exists({ table: 'tags', column: 'id' })])),
    image: schema.file.optional({ extnames: ['jpg', 'png'], size: '1mb' }),
})

export const validateRestaurantsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
    })
}

export const storeRoute = async ({ request }: HttpContextContract) => {
    const { name, description, lat, lng, tags, image } = await validateRestaurantsParams(request)
    const restaurant = await Restaurant.create({
        name,
        description,
        lat,
        lng,
        image: image ? Attachment.fromFile(image) : undefined,
    })

    await RestaurantTag.createMany(tags.map((tagId) => ({ restaurantId: restaurant.id, tagId })))

    await restaurant.load('tags')

    Ws.io.to('connectedSockets').emit('createRestaurant', restaurant)

    return restaurant
}
