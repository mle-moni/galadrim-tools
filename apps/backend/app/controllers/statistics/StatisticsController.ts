import { HttpContext } from '@adonisjs/core/http'
import { getEventsAmountPerGaladrimeurs } from './getEventsAmountPerGaladrimeurs.js'
import { getGaladrimeurFavoriteRooms } from './getGaladrimeurFavoriteRooms.js'
import { getTimePerGaladrimeurs } from './getTimePerGaladrimeurs.js'

export default class StatisticsController {
  public async favoriteRoom(params: HttpContext) {
    return getGaladrimeurFavoriteRooms(params)
  }
  public async time(params: HttpContext) {
    return getTimePerGaladrimeurs(params)
  }
  public async amount(params: HttpContext) {
    return getEventsAmountPerGaladrimeurs(params)
  }
}
