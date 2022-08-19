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

export interface DashboardInfos {
    memoryUsed: number
    totalMemory: number
    sysUptime: number
    loadAverage1: number
    loadAverage5: number
    loadAverage15: number
}
