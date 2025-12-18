import type { ApiError, IUserData } from "@galadrim-tools/shared";
import { queryOptions } from "@tanstack/react-query";

import { fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

export type LoginInput = {
    email: string;
    password: string;
};

export async function login(input: LoginInput): Promise<IUserData> {
    const data = new FormData();
    data.append("email", input.email);
    data.append("password", input.password);

    const res = await fetchBackendJson<IUserData, ApiError>("/login", "POST", {
        body: data,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Adresse mail ou mot de passe incorrect"));
    }

    return res.json;
}

export async function fetchMe(): Promise<IUserData> {
    const res = await fetchBackendJson<IUserData, ApiError>("/me", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, `Vous n'êtes pas connecté`));
    }

    return res.json;
}

export function meQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.me(),
        queryFn: fetchMe,
        retry: false,
    });
}
