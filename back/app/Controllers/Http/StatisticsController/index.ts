import { getEventsAmountPerGaladrimeurs } from './routes/amount'
import { getGaladrimeurFavoriteRooms } from './routes/rooms'
import { getTimePerGaladrimeurs } from './routes/time'

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
