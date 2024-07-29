import Restaurant from '#models/restaurant'
import RestaurantChoice from '#models/restaurant_choice'
import { formatDateToNumber } from '#services/date'
import { Ws } from '#services/ws'
import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'

const choiceSchema = schema.create({
  restaurantId: schema.number(),
})

const notifyUser = async (restaurantId: number, userPersonalSocket: string) => {
  const restaurant = await Restaurant.fetchById(restaurantId)

  Ws.io.to('connectedSockets').emit('updateRestaurant', restaurant)
  Ws.io.to(userPersonalSocket).emit('chooseRestaurant', restaurant)
}

export const createOrUpdateChoiceRoute = async ({ auth, request, response }: HttpContext) => {
  const user = auth.user!
  const userId = user.id
  const { restaurantId } = await request.validate({
    schema: choiceSchema,
  })
  const found = Restaurant.find(restaurantId)
  if (!found) {
    return response.notFound({ error: `Ce restaurant n'existe pas` })
  }

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
      await notifyUser(restaurantId, user.personalSocket)
      return { message: 'Le choix a été supprimé' }
    }
    return response.badRequest({ error: 'Doucement, il ne faudrait pas casser la souris' })
  }

  const restaurantChoice = await RestaurantChoice.updateOrCreate(
    { userId, day },
    { restaurantId, userId, day }
  )

  if (prevRestaurantChoice) await notifyUser(prevRestaurantChoice.restaurantId, user.personalSocket)
  await notifyUser(restaurantId, user.personalSocket)

  return { message: `Vous choisissez ce restaurant`, choice: restaurantChoice.frontendData }
}
