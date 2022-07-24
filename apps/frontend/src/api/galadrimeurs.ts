import { ApiError } from '@galadrim-rooms/shared'
import { fetchBackendJson } from './fetch'

export interface UserData {
    id: number
    username: string
    imageUrl: string | null
}

export const fetchUsers = async () => {
    const res = await fetchBackendJson<UserData[], ApiError>('/users')
    if (res.ok) return res.json
    return []
}
