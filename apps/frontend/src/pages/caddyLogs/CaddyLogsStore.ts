import { format } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { HTTPMethod, fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { notifyError } from '../../utils/notification'
import { APPLICATION_JSON_HEADERS } from '../idea/createIdea/CreateIdeaStore'

export interface CaddyLog {
    level: 'info' | 'error'
    ts: string
    logger: string
    msg: string
    request: {
        client_ip: string
        method: HTTPMethod
        host: string
        uri: string
    }
    request_bytes_read: number
    user_id: string
    duration_in_s: number
    duration_in_ms: number
    response_size: number
    status: number
}

export class CaddyLogsStore {
    data: CaddyLog[] = []

    constructor() {
        makeAutoObservable(this)
    }

    loadingState = new LoadingStateStore()

    async fetch(fileName: string) {
        this.loadingState.setIsLoading(true)
        const res = await fetchBackendJson<CaddyLog[], unknown>(`/caddyLogs/${fileName}`, 'GET', {
            headers: APPLICATION_JSON_HEADERS,
        })
        this.loadingState.setIsLoading(false)

        if (!res.ok) {
            notifyError(getErrorMessage(res.json, 'Erreur lors de la récupération des logs'))
            return
        }

        this.setLogs(res.json)
    }

    setLogs(data: CaddyLog[]) {
        this.data = data.map((l) => ({
            ...l,
            duration_in_ms: Math.round(l.duration_in_s * 1000),
            ts: format(new Date(l.ts), 'dd/MM/yyyy HH:mm:ss'),
        }))
    }
}
