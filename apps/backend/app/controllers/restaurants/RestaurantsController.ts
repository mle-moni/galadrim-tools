import { HttpContext } from '@adonisjs/core/http'
import { createOrUpdateChoiceRoute } from './createOrUpdateChoice.js'
import { destroyRoute } from './destroyRestaurant.js'
import { indexRoute } from './restaurantsIndex.js'
import { showRoute } from './showRestaurant.js'
import { storeRoute } from './storeRestaurant.js'
import { updateRoute } from './updateRestaurant.js'

export default class RestaurantsController {
  public async index(params: HttpContext) {
    return indexRoute(params)
  }

  public async store(params: HttpContext) {
    return storeRoute(params)
  }

  public async show(params: HttpContext) {
    return showRoute(params)
  }

  public async update(params: HttpContext) {
    return updateRoute(params)
  }

  public async destroy(params: HttpContext) {
    return destroyRoute(params)
  }

  public async createOrUpdateChoice(params: HttpContext) {
    return createOrUpdateChoiceRoute(params)
  }
}
