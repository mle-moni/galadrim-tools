import { ApiError, fetchBackendJson } from './fetch'

export const fetchGaladrimeurs = async () => {
    const res = await fetchBackendJson<string[], ApiError>('/galadrimeurs')
    if (res.ok) return res.json
    return []
}

export interface UserData {
    id: number
    username: string
}

export const fetchUsers = async () => {
    const res = await fetchBackendJson<UserData[], ApiError>('/users')
    if (res.ok) return res.json
    return []
}
