import User from '#models/user'
import { AuthorizationResponse, BasePolicy } from '@adonisjs/bouncer'
import { AllRights } from '@galadrim-tools/shared'

interface Resource {
  userId: number | null
}

export default class RestaurantPolicy extends BasePolicy {
  public async before(user: User | null, _resource?: Resource, type?: AllRights) {
    if (type !== undefined && user && user.hasRights([type])) {
      return true
    }
  }

  public async viewUpdateOrDelete(user: User, resource: Resource, _type?: AllRights) {
    if (user.id !== resource.userId) {
      return AuthorizationResponse.deny("Vous n'avez pas les droits nécessaires")
    }
    return true
  }
}
