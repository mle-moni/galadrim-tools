import { ApiError, ApiErrors } from '@galadrim-rooms/shared'

export const getSocketApiUrl = () => {
    const url = import.meta.env.VITE_SOCKET_API_URL
    if (typeof url !== 'string') throw new Error(`VITE_SOCKET_API_URL should be a valid string`)
    return url
}

export const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL
    if (typeof url !== 'string') throw new Error(`VITE_API_URL should be a valid string`)
    return url
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const fetchBackend = (
    endpoint: string,
    method: HTTPMethod = 'GET',
    request?: RequestInit
) => {
    return fetch(getApiUrl() + endpoint, {
        ...request,
        method,
        credentials: 'include',
    })
}

export const fetchBackendJson = async <TSuccess, TError>(
    endpoint: string,
    method: HTTPMethod = 'GET',
    request?: RequestInit
): Promise<
    { ok: true; status: number; json: TSuccess } | { ok: false; status: number; json: TError }
> => {
    const data = await fetchBackend(endpoint, method, request)
    const json = await data.json()
    return { ok: data.ok, status: data.status, json }
}

export const isApiError = (error: unknown): error is ApiError => {
    return typeof (error as ApiError)?.error === 'string'
}

export function isApiSchemaError(error: unknown): error is ApiErrors {
    return typeof (error as ApiErrors)?.errors === 'object'
}

export const getErrorMessage = (
    error: unknown,
    backupMessage = 'Une erreur imprévue est survenue'
) => {
    if (isApiError(error)) {
        return error.error
    }
    if (isApiSchemaError(error)) {
        return error.errors[0].message
    }
    console.error(error)
    return backupMessage
}
