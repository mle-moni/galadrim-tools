import { ApiError, DashboardInfos, _assert } from '@galadrim-rooms/shared'
import { action, makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../../api/fetch'
import { notifyError } from '../../../utils/notification'
import { DashboardElementProps } from './Dashboard'
import {
    getAllMemoryInfos,
    getLoadInfos,
    getMemoryUsedInfos,
    getUptimeInfos,
} from './dashboardFunctions'

type IntervalId = ReturnType<typeof setInterval>

export class DashboardStore {
    private _infos: DashboardInfos | null = null

    private intervalId?: IntervalId = undefined

    ready = false

    constructor() {
        makeAutoObservable(this, { setInfos: action })
    }

    init() {
        this.intervalId = this.createFetchInterval()
    }

    setInfos(infos: DashboardInfos) {
        this._infos = infos
        if (!this.ready) {
            this.ready = true
        }
    }

    private createFetchInterval(fetchInterval = 5000) {
        this.fetch()
        const intervalId = setInterval(() => {
            this.fetch()
        }, fetchInterval)

        return intervalId
    }

    async fetch() {
        const res = await fetchBackendJson<DashboardInfos, ApiError>('/admin/dashboard')

        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, `Impossible d'envoyer un mail a cette adresse, bizarre`)
            )
        }

        this.setInfos(res.json)
    }

    get infos(): DashboardInfos {
        _assert(this._infos, 'make sure DashboardStore.ready is true before using this computed')

        return this._infos
    }

    cleanup() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }
    }

    setFetchInterval(fetchInterval: number) {
        this.cleanup()
        this.createFetchInterval(fetchInterval)
    }

    get memoryUsedInfos(): DashboardElementProps['options'] {
        return getMemoryUsedInfos(this.infos.memoryUsed, this.infos.totalMemory)
    }

    get allMemoryInfos(): DashboardElementProps['options'] {
        return getAllMemoryInfos(this.infos.totalMemory)
    }

    get uptimeInfos(): DashboardElementProps['options'] {
        return getUptimeInfos(this.infos.sysUptime)
    }

    get load1MinInfos(): DashboardElementProps['options'] {
        return getLoadInfos(this.infos.loadAverage1, 1)
    }

    get load5MinInfos(): DashboardElementProps['options'] {
        return getLoadInfos(this.infos.loadAverage5, 5)
    }

    get load15MinInfos(): DashboardElementProps['options'] {
        return getLoadInfos(this.infos.loadAverage15, 15)
    }
}
