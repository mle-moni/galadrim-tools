import { format } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { notifyError } from '../../utils/notification'
import { APPLICATION_JSON_HEADERS } from '../idea/createIdea/CreateIdeaStore'
import { AtopLog } from './atop.types'

const FIVE_MIN_IN_MS = 5 * 60 * 1000

export class AtopLogsStore {
    originalData: AtopLog[] = []

    start: Date | null = null
    end: Date | null = null

    constructor() {
        makeAutoObservable(this)
    }

    loadingState = new LoadingStateStore()

    async fetch(fileName: string) {
        this.loadingState.setIsLoading(true)
        const res = await fetchBackendJson<AtopLog[], unknown>(`/atopLogs/${fileName}`, 'GET', {
            headers: APPLICATION_JSON_HEADERS,
        })
        this.loadingState.setIsLoading(false)

        if (!res.ok) {
            notifyError(getErrorMessage(res.json, 'Erreur lors de la récupération des logs'))
            return
        }

        this.setLogs(res.json)
    }

    setLogs(newData: AtopLog[]) {
        this.originalData = newData
    }

    get data() {
        return this.originalData.map((l) => ({
            ...l,
            dateFormatted: format(new Date(l.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        }))
    }

    setStart(date: Date | null) {
        this.start = date
    }

    setEnd(date: Date | null) {
        this.end = date
    }

    get filteredData() {
        return this.data.filter((l) => {
            const logDate = new Date(l.timestamp)

            if (this.start && logDate < this.start) return false
            if (this.end && logDate > this.end) return false

            return true
        })
    }

    get memoryData(): ChartRowData {
        if (this.filteredData.length === 0) return []

        const data: [string, number][] = this.filteredData.map((l) => {
            const memUsedInBytes = l.MEM.physmem - l.MEM.freemem
            const memUsedInPercent = Math.round((memUsedInBytes / l.MEM.physmem) * 100)

            return [l.dateFormatted, memUsedInPercent]
        })

        return data
    }
}
