import type User from "#models/user";
import { AuthorizationResponse } from "@adonisjs/bouncer";
import type { AllRights } from "@galadrim-tools/shared";
import { ReservationServiceError } from "./reservation_errors.js";

export interface OwnedResource {
    userId: number | null;
}

export const canMutateOwnedResource = (
    user: User,
    resource: OwnedResource,
    bypassRight?: AllRights,
) => {
    if (bypassRight !== undefined && user.hasRights([bypassRight])) {
        return true;
    }

    return user.id === resource.userId;
};

export const authorizeOwnedResourceMutation = (
    user: User,
    resource: OwnedResource,
    bypassRight?: AllRights,
) => {
    if (!canMutateOwnedResource(user, resource, bypassRight)) {
        throw new ReservationServiceError(
            "FORBIDDEN",
            "Vous n'avez pas les droits nécessaires",
            403,
        );
    }
};

export const ownedResourceAuthorizationResponse = (
    user: User,
    resource: OwnedResource,
    bypassRight?: AllRights,
) => {
    if (canMutateOwnedResource(user, resource, bypassRight)) {
        return true;
    }

    return AuthorizationResponse.deny("Vous n'avez pas les droits nécessaires");
};
