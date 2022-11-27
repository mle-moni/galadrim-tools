import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Idea from '../Models/Idea'
import User from '../Models/User'

export default class IdeaPolicy extends BasePolicy {
    public async before(user: User | null) {
        if (user && user.hasRights(['IDEAS_ADMIN'])) {
            return true
        }
    }

    public async viewUpdateOrDelete(user: User, idea: Idea) {
        if (user.id !== idea.userId) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }

    public async setIdeaDone(_user: User, done?: boolean) {
        if (done !== undefined) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }
}
