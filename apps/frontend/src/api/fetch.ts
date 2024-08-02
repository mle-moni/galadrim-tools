import type { AdonisApiError, ApiError, ApiErrors } from "@galadrim-tools/shared";

export const getSocketApiUrl = () => {
    const url = import.meta.env.VITE_SOCKET_API_URL;
    if (typeof url !== "string") throw new Error("VITE_SOCKET_API_URL should be a valid string");
    return url;
};

export const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;
    if (typeof url !== "string") throw new Error("VITE_API_URL should be a valid string");
    return url;
};

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
export const HTTP_METHODS_OPTIONS = HTTP_METHODS.map((value) => ({
    value,
    label: value,
}));
export type HTTPMethod = (typeof HTTP_METHODS)[number];

export const fetchBackend = (
    endpoint: string,
    method: HTTPMethod = "GET",
    request?: RequestInit,
) => {
    return fetch(getApiUrl() + endpoint, {
        ...request,
        method,
        credentials: "include",
    });
};

export const fetchBackendJson = async <TSuccess, TError>(
    endpoint: string,
    method: HTTPMethod = "GET",
    request?: RequestInit,
): Promise<
    { ok: true; status: number; json: TSuccess } | { ok: false; status: number; json: TError }
> => {
    const data = await fetchBackend(endpoint, method, request);
    const json = await data.json();
    return { ok: data.ok, status: data.status, json };
};

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
        return error.errors[0].message;
    }
    if (isAdonisApiError(error)) {
        const errorMessageArr = error.message.split(": ");
        if (errorMessageArr.length === 2) {
            return errorMessageArr[1];
        }
    }
    console.error(error);
    return backupMessage;
};
