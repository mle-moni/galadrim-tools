import type { ApiError, DashboardInfos } from "@galadrim-tools/shared";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";

export type ApiNotification = {
    notification: string;
};

export type CreateUserInput = {
    email: string;
    username: string;
};

export async function createUser(input: CreateUserInput): Promise<ApiNotification> {
    const body = new FormData();
    body.append("email", input.email);
    body.append("username", input.username);

    const res = await fetchBackendJson<ApiNotification, ApiError>("/admin/createUser", "POST", {
        body,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer l'utilisateur"));
    }

    return res.json;
}

export type ApiUserRights = {
    id: number;
    username: string;
    rights: number;
};

export async function fetchUserRights(): Promise<ApiUserRights[]> {
    const res = await fetchBackendJson<ApiUserRights[], ApiError>("/admin/userRights", "GET");

    if (!res.ok) {
        throw new Error(
            getErrorMessage(res.json, "Impossible de récupérer les droits utilisateurs"),
        );
    }

    return res.json;
}

export type UpdateUserRightsInput = {
    id: number;
    rights: number;
};

export async function updateUserRights(input: UpdateUserRightsInput): Promise<ApiNotification> {
    const body = new FormData();
    body.append("id", input.id.toString());
    body.append("rights", input.rights.toString());

    const res = await fetchBackendJson<ApiNotification, ApiError>("/admin/userRights", "PUT", {
        body,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de sauvegarder les droits"));
    }

    return res.json;
}

export type CreateAdminNotificationInput = {
    userIds: number[];
    title: string;
    text: string;
    link?: string;
};

export async function createAdminNotification(
    input: CreateAdminNotificationInput,
): Promise<ApiNotification> {
    const res = await fetchBackendJson<ApiNotification, ApiError>(
        "/admin/createNotification",
        "POST",
        {
            body: JSON.stringify(input),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible d'envoyer la notification"));
    }

    return res.json;
}

export async function fetchDashboardInfos(): Promise<DashboardInfos> {
    const res = await fetchBackendJson<DashboardInfos, ApiError>("/admin/dashboard", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de charger le dashboard"));
    }

    return res.json;
}
