import { ApiError, fetchBackendJson } from './fetch'

export const fetchGaladrimeurs = async () => {
    const res = await fetchBackendJson<string[], ApiError>('/galadrimeurs')
    if (res.ok) return res.json
    return []
}
