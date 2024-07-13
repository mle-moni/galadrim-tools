import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from '../Models/User.js'

interface Resource {
    userId: number | null
}

export default class RestaurantPolicy extends BasePolicy {
    public async before(user: User | null) {
        if (user && user.hasRights(['MIAM_ADMIN'])) {
            return true
        }
    }

    public async viewUpdateOrDelete(user: User, resource: Resource) {
        if (user.id !== resource.userId) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }
}
