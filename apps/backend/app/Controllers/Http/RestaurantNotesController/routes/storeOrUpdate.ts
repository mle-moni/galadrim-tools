import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Restaurant from '../../../../Models/Restaurant'
import RestaurantNote from '../../../../Models/RestaurantNote'
import Ws from '../../../../Services/Ws'

const noteValidationSchema = schema.create({
    restaurant_id: schema.number([rules.exists({ table: 'restaurants', column: 'id' })]),
    note: schema.enum(['1', '2', '3', '4', '5'] as const),
})

export const validateNoteParams = async (request: HttpContextContract['request']) => {
    return request.validate({
        schema: noteValidationSchema,
    })
}

export const storeOrUpdateRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!

    const { restaurant_id: restaurantId, note } = await validateNoteParams(request)

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
