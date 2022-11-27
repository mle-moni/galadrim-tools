import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Restaurant from '../Models/Restaurant'
import User from '../Models/User'

export default class RestaurantPolicy extends BasePolicy {
    public async before(user: User | null) {
        if (user && user.hasRights(['MIAM_ADMIN'])) {
            return true
        }
    }

    public async viewUpdateOrDelete(user: User, resto: Restaurant) {
        if (user.id !== resto.userId) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }
}
