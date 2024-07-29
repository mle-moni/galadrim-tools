import Restaurant from '#models/restaurant'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'

export const destroyRoute = async ({ params, bouncer }: HttpContext) => {
  const restaurant = await Restaurant.findOrFail(params.id)

  await bouncer.with('ResourcePolicy').authorize('viewUpdateOrDelete', restaurant, 'MIAM_ADMIN')

  await restaurant.load((builder) =>
    builder.preload('tags').preload('notes').preload('choices').preload('reviews')
  )
  const eventJson = restaurant.frontendData
  await restaurant.delete()

  Ws.io.to('connectedSockets').emit('deleteRestaurant', eventJson)
  return { id: restaurant.id, deleted: true }
}
