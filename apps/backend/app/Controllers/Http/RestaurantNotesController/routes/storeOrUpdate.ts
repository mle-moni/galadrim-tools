import { NotesOption } from '@galadrim-rooms/shared'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Restaurant from '../../../../Models/Restaurant'
import RestaurantNote from '../../../../Models/RestaurantNote'
import Ws from '../../../../Services/Ws'

const noteValidationSchema = schema.create({
    restaurant_id: schema.number([rules.exists({ table: 'restaurants', column: 'id' })]),
    note: schema.number([rules.range(1, 5)]),
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
            note: note as NotesOption,
        }
    )

    const restaurant = Restaurant.fetchById(restaurantId)

    Ws.io.to('connectedSockets').emit('updateRestaurant', restaurant)

    return restaurantNote
}
