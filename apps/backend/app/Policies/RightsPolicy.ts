import { AllRights, hasRights } from '@galadrim-tools/shared'
import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export default class RightsPolicy extends BasePolicy {
    public async hasRight(user: User, right: AllRights) {
        if (hasRights(user.rights, [right]) === false) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }

    public async hasRights(user: User, rights: AllRights[]) {
        if (hasRights(user.rights, rights) === false) {
            return Bouncer.deny("Vous n'avez pas les droits nécessaires")
        }
        return true
    }
}
