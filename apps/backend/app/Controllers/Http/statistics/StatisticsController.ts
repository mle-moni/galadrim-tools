import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getEventsAmountPerGaladrimeurs } from './getEventsAmountPerGaladrimeurs'
import { getGaladrimeurFavoriteRooms } from './getGaladrimeurFavoriteRooms'
import { getTimePerGaladrimeurs } from './getTimePerGaladrimeurs'

export default class StatisticsController {
    public async favoriteRoom(params: HttpContextContract) {
        return getGaladrimeurFavoriteRooms(params)
    }
    public async time(params: HttpContextContract) {
        return getTimePerGaladrimeurs(params)
    }
    public async amount(params: HttpContextContract) {
        return getEventsAmountPerGaladrimeurs(params)
    }
}
