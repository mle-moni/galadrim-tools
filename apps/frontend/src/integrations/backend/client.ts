import type { AdonisApiError, ApiError, ApiErrors } from "@galadrim-tools/shared";

const DEFAULT_API_URL = "http://localhost:3333";

export function getApiUrl() {
    const url = import.meta.env.VITE_API_URL;
    if (typeof url === "string" && url.length > 0) return url;
    return DEFAULT_API_URL;
}

export const APPLICATION_JSON_HEADERS = {
    "Content-Type": "application/json",
} as const;

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
export type HTTPMethod = (typeof HTTP_METHODS)[number];

export function fetchBackend(endpoint: string, init: RequestInit = {}) {
    const url = new URL(endpoint, getApiUrl());
    return fetch(url, {
        ...init,
        credentials: "include",
    });
}

export async function fetchBackendJson<TSuccess, TError = unknown>(
    endpoint: string,
    method: HTTPMethod = "GET",
    init: RequestInit = {},
): Promise<
    { ok: true; status: number; json: TSuccess } | { ok: false; status: number; json: TError }
> {
    const res = await fetchBackend(endpoint, { ...init, method });

    let json: unknown = null;
    try {
        json = await res.json();
    } catch {
        // ignore non-json responses
    }

    if (res.ok) return { ok: true, status: res.status, json: json as TSuccess };
    return { ok: false, status: res.status, json: json as TError };
}

export const isApiError = (error: unknown): error is ApiError => {
    return typeof (error as ApiError)?.error === "string";
};

export function isApiSchemaError(error: unknown): error is ApiErrors {
    return typeof (error as ApiErrors)?.errors === "object";
}

export const isAdonisApiError = (error: unknown): error is AdonisApiError => {
    const errorCast = error as AdonisApiError;
    return typeof errorCast?.code === "string" && typeof errorCast?.message === "string";
};

export const getErrorMessage = (
    error: unknown,
    backupMessage = "Une erreur imprévue est survenue",
) => {
    if (isApiError(error)) {
        return error.error;
    }
    if (isApiSchemaError(error)) {
        return error.errors[0]?.message ?? backupMessage;
    }
    if (isAdonisApiError(error)) {
        const errorMessageArr = error.message.split(": ");
        if (errorMessageArr.length === 2) {
            return errorMessageArr[1] ?? backupMessage;
        }
    }
    return backupMessage;
};
