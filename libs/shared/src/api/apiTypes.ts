export type ApiFormError = {
    rule: string
    field: string
    message: string
}
export interface ApiErrors {
    errors: ApiFormError[]
}

export interface ApiNotification {
    notification: string
}

export interface ApiError {
    error: string
}
