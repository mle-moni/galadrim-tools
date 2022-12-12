import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Restaurant from 'App/Models/Restaurant'
import RestaurantChoice from 'App/Models/RestaurantChoice'
import { formatDateToNumber } from 'App/Services/Date'
import Ws from 'App/Services/Ws'

const choiceSchema = schema.create({
    restaurantId: schema.number([rules.exists({ table: 'restaurants', column: 'id' })]),
})

const notifyUser = async (restaurantId: number) => {
    const restaurant = await Restaurant.fetchById(restaurantId)

    Ws.io.to('connectedSockets').emit('updateRestaurant', restaurant)
}

export const createOrUpdateChoiceRoute = async ({
    auth,
    request,
    response,
}: HttpContextContract) => {
    const user = auth.user!
    const userId = user.id
    const { restaurantId } = await request.validate({
        schema: choiceSchema,
    })

    const day = formatDateToNumber(new Date())

    const prevRestaurantChoice = await RestaurantChoice.query()
        .where('user_id', userId)
        .andWhere('day', day)
        .first()

    if (prevRestaurantChoice?.restaurantId === restaurantId) {
        const [numberOfDeletedItems] = await RestaurantChoice.query()
            .where('user_id', userId)
            .andWhere('day', day)
            .delete()
        if (numberOfDeletedItems === 1) {
            await notifyUser(restaurantId)
            return { message: 'Le choix a été supprimé' }
        }
        return response.badRequest({ error: 'Doucement, il ne faudrait pas casser la souris' })
    }

    const restaurantChoice = await RestaurantChoice.updateOrCreate(
        { userId, day },
        { restaurantId, userId, day }
    )

    if (prevRestaurantChoice) await notifyUser(prevRestaurantChoice.restaurantId)
    await notifyUser(restaurantId)

    return { message: `Vous choisissez ce restaurant`, choice: restaurantChoice.frontendData }
}
