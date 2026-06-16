import type User from "#models/user";
import { BasePolicy } from "@adonisjs/bouncer";
import type { AllRights } from "@galadrim-tools/shared";
import { ownedResourceAuthorizationResponse } from "#services/reservation_authorization";

interface Resource {
    userId: number | null;
}

export default class RestaurantPolicy extends BasePolicy {
    public async viewUpdateOrDelete(user: User, resource: Resource, bypassRight?: AllRights) {
        return ownedResourceAuthorizationResponse(user, resource, bypassRight);
    }
}
