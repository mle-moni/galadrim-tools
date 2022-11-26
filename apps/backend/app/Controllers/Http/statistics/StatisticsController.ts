import { getEventsAmountPerGaladrimeurs } from './getEventsAmountPerGaladrimeurs'
import { getGaladrimeurFavoriteRooms } from './getGaladrimeurFavoriteRooms'
import { getTimePerGaladrimeurs } from './getTimePerGaladrimeurs'

export default class StatisticsController {
    public async favoriteRoom() {
        return getGaladrimeurFavoriteRooms()
    }
    public async time() {
        return getTimePerGaladrimeurs()
    }
    public async amount() {
        return getEventsAmountPerGaladrimeurs()
    }
}
