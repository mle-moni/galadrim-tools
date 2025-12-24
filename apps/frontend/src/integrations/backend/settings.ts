import type { ApiError, IUserData } from "@galadrim-tools/shared";

import { fetchBackendJson, getErrorMessage } from "./client";

export type ApiToken = {
    type: "bearer";
    token: string;
};

export async function logout(): Promise<{ notification: string }> {
    const res = await fetchBackendJson<{ notification: string }, ApiError>("/logout", "POST");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de se déconnecter"));
    }

    return res.json;
}

export async function createApiToken(): Promise<ApiToken> {
    const res = await fetchBackendJson<ApiToken, ApiError>("/createApiToken", "POST");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer un API token"));
    }

    return res.json;
}

export async function changePassword(password: string): Promise<{ notification: string }> {
    const body = new FormData();
    body.append("password", password);

    const res = await fetchBackendJson<{ notification: string }, ApiError>(
        "/changePassword",
        "POST",
        {
            body,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de modifier le mot de passe"));
    }

    return res.json;
}

export async function changeDefaultOffice(officeId: number): Promise<{ notification: string }> {
    const body = new FormData();
    body.append("officeId", officeId.toString());

    const res = await fetchBackendJson<{ notification: string }, ApiError>(
        "/changeDefaultOffice",
        "POST",
        {
            body,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de sauvegarder les paramètres"));
    }

    return res.json;
}

export async function updateNotificationsSettings(
    notificationsSettings: number,
): Promise<{ message: string }> {
    const body = new FormData();
    body.append("notificationsSettings", notificationsSettings.toString());

    const res = await fetchBackendJson<{ message: string }, ApiError>(
        "/updateNotificationsSettings",
        "POST",
        {
            body,
        },
    );

    if (!res.ok) {
        throw new Error(
            getErrorMessage(res.json, "Impossible de mettre à jour ce paramètre de notification"),
        );
    }

    return res.json;
}

export type UpdateProfileInput = {
    username: string;
    email: string;
    avatarFile?: File | null;
};

export async function updateProfile(input: UpdateProfileInput): Promise<IUserData> {
    const body = new FormData();
    body.append("username", input.username);
    body.append("email", input.email);
    if (input.avatarFile) {
        body.append("image", input.avatarFile);
    }

    const res = await fetchBackendJson<IUserData, ApiError>("/updateProfile", "POST", {
        body,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de mettre à jour le profil"));
    }

    return res.json;
}
