import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Restaurant from 'App/Models/Restaurant'
import RestaurantTag from 'App/Models/RestaurantTag'
import Ws from 'App/Services/Ws'

const StoreValidationSchema = schema.create({
    name: schema.string([rules.trim(), rules.maxLength(40), rules.minLength(2)]),
    description: schema.string([rules.trim(), rules.maxLength(100), rules.minLength(2)]),
    lat: schema.number(),
    lng: schema.number(),
    tags: schema.array().members(schema.number([rules.exists({ table: 'tags', column: 'id' })])),
    image: schema.file.optional({ extnames: ['jpg', 'png', 'jpeg'], size: '1mb' }),
    averagePrice: schema.number.optional(),
})

export const validateRestaurantsParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: StoreValidationSchema,
        messages: {
            'name.required': 'Le nom est requis',
            'name.maxLength': 'Le nom est trop grand',
            'name.minLength': 'Le nom est trop court',
            'description.required': 'La description est requise',
            'description.maxLength': 'La description est trop grande',
            'description.minLength': 'La description est trop courte',
            'lat.required': 'La latitude est requise',
            'lat.number': 'La latitude doit être un nombre',
            'lng.required': 'La longitude est requise',
            'lng.number': 'La longitude doit être un nombre',
            'tags.required': 'Il doit y avoir au moins 1 tag',
            'tags.exists': 'Les tags doivent exister (tu nous fais quoi) !!?',
            'file.size': 'Le fichier est trop grand (max 1mo)',
            'file.extname': 'Le fichier doit être au format jpg ou png',
        },
    })
}

export const storeRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!
    const { name, description, lat, lng, tags, image, averagePrice } =
        await validateRestaurantsParams(request)
    const restaurant = await Restaurant.create({
        name,
        description,
        lat,
        lng,
        averagePrice,
        userId: user.id,
        image: image ? Attachment.fromFile(image) : undefined,
    })

    await RestaurantTag.createMany(tags.map((tagId) => ({ restaurantId: restaurant.id, tagId })))

    const restaurantToSend = await Restaurant.fetchById(restaurant.id)

    Ws.io.to('connectedSockets').emit('createRestaurant', restaurantToSend)

    return restaurantToSend
}
