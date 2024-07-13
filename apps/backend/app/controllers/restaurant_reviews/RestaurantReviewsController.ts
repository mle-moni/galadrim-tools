import { HttpContext } from '@adonisjs/core/http'
import { destroyRestaurantReview } from './destroyRestaurantReview.js'
import { restaurantReviewsList } from './restaurantReviewsList.js'
import { showRestaurantReview } from './showRestaurantReview.js'
import { storeRestaurantReview } from './storeRestaurantReview.js'
import { updateRestaurantReview } from './updateRestaurantReview.js'

export default class RestaurantReviewsController {
  public async index(ctx: HttpContext) {
    return restaurantReviewsList(ctx)
  }

  public async store(ctx: HttpContext) {
    return storeRestaurantReview(ctx)
  }

  public async show(ctx: HttpContext) {
    return showRestaurantReview(ctx)
  }

  public async update(ctx: HttpContext) {
    return updateRestaurantReview(ctx)
  }

  public async destroy(ctx: HttpContext) {
    return destroyRestaurantReview(ctx)
  }
}
