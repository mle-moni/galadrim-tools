import type User from "#models/user";
import { AuthorizationResponse, BasePolicy } from "@adonisjs/bouncer";
import type { AllRights } from "@galadrim-tools/shared";

interface Resource {
    userId: number | null;
}

export default class RestaurantPolicy extends BasePolicy {
    public async viewUpdateOrDelete(user: User, resource: Resource, bypassRight?: AllRights) {
        if (bypassRight !== undefined && user.hasRights([bypassRight])) {
            return true;
        }

        if (user.id !== resource.userId) {
            return AuthorizationResponse.deny("Vous n'avez pas les droits nécessaires");
        }

        return true;
    }
}
