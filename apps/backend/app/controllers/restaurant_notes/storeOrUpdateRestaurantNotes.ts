import Restaurant from '#models/restaurant'
import RestaurantNote from '#models/restaurant_note'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'

const noteValidationSchema = schema.create({
  restaurant_id: schema.number(),
  note: schema.enum(['1', '2', '3', '4', '5'] as const),
})

export const validateNoteParams = async (request: HttpContext['request']) => {
  return request.validate({
    schema: noteValidationSchema,
    messages: {
      'restaurant_id.required': 'La référence du restaurant à noter est nécessaire',
      'restaurant_id.number': "L'id du restaurant doit ếtre un nombre",
    },
  })
}

export const storeOrUpdateRoute = async ({ request, auth }: HttpContext) => {
  const user = auth.user!

  const { restaurant_id: restaurantId, note } = await validateNoteParams(request)

  await Restaurant.findOrFail(restaurantId)

  const userId = user.id

  const restaurantNote = await RestaurantNote.updateOrCreate(
    { restaurantId, userId },
    {
      userId,
      restaurantId,
      note: note,
    }
  )

  const restaurant = await Restaurant.fetchById(restaurantId)

  Ws.io.to('connectedSockets').emit('updateRestaurant', restaurant)

  return restaurantNote
}
