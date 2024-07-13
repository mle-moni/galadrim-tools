import Restaurant from '#models/restaurant'
import RestaurantTag from '#models/restaurant_tag'
import Tag from '#models/tag'
import { imageAttachmentFromFile } from '#services/attachment'
import { createNotificationForUsers } from '#services/notifications'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'

const StoreValidationSchema = schema.create({
  name: schema.string([rules.trim(), rules.maxLength(40), rules.minLength(2)]),
  description: schema.string([rules.trim(), rules.maxLength(100), rules.minLength(2)]),
  lat: schema.number(),
  lng: schema.number(),
  websiteLink: schema.string.optional([rules.url()]),
  tags: schema.array().members(schema.number()),
  image: schema.file.optional({ extnames: ['jpg', 'png', 'jpeg'], size: '1mb' }),
  averagePrice: schema.number.optional(),
})

export const validateRestaurantsParams = async (request: HttpContext['request']) => {
  return request.validate({
    schema: StoreValidationSchema,
    messages: {
      'name.required': 'Le nom est requis',
      'name.maxLength': 'Le nom est trop grand',
      'name.minLength': 'Le nom est trop court',
      'description.required': 'La description est requise',
      'description.maxLength': 'La description est trop grande',
      'description.minLength': 'La description est trop courte',
      'websiteLink.url': 'Le lien du site web doit être une url',
      'lat.required': 'La latitude est requise',
      'lat.number': 'La latitude doit être un nombre',
      'lng.required': 'La longitude est requise',
      'lng.number': 'La longitude doit être un nombre',
      'tags.required': 'Il doit y avoir au moins 1 tag',
      'file.size': 'Le fichier est trop grand (max 1mo)',
      'file.extname': 'Le fichier doit être au format jpg ou png',
    },
  })
}

export const storeRoute = async ({ request, auth, response }: HttpContext) => {
  const user = auth.user!
  const { name, description, lat, lng, tags, image, averagePrice, websiteLink } =
    await validateRestaurantsParams(request)

  const foundTags = await Tag.query().whereIn('id', tags)

  if (foundTags.length !== tags.length) {
    return response.badRequest({
      error: 'Les tags doivent exister (tu nous fais quoi) !!?',
    })
  }

  const restaurant = await Restaurant.create({
    name,
    description,
    lat,
    lng,
    websiteLink,
    averagePrice,
    userId: user.id,
    image: image ? imageAttachmentFromFile(image, 'restaurant') : undefined,
  })

  await RestaurantTag.createMany(tags.map((tagId) => ({ restaurantId: restaurant.id, tagId })))

  const restaurantToSend = await Restaurant.fetchById(restaurant.id)

  Ws.io.to('connectedSockets').emit('createRestaurant', restaurantToSend)

  createNotificationForUsers(
    {
      title: 'Nouveau restaurant',
      text: `${name} ajouté par ${user.username}`,
      type: 'NEW_RESTAURANT',
      link: `/saveur?zoom=18&restaurant-id=${restaurant.id}`,
    },
    user.id
  )

  return restaurantToSend
}
