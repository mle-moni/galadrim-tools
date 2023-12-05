import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from '../Models/User'

interface Resource {
    userId: number | null
}

export default class PollPolicy extends BasePolicy {
    public async before(user: User | null) {
        if (user && user.hasRights(['POLL_ADMIN'])) {
            return true
        }
    }

    public async isOwner(user: User, resource: Resource) {
        if (user.id !== resource.userId) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }
}
