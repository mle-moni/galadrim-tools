import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../../api/fetch'
import { AppStore } from '../../../globalStores/AppStore'
import { LoadingStateStore } from '../../../reusableComponents/form/LoadingStateStore'
import { notifyError } from '../../../utils/notification'
import { ResultRow } from './TournoisPage'

interface TournoisResult {
    id: number
    mapId: number
    userId: number
    score: number
    jumps: number
    time: number
}

export class TournoisResultsStore {
    loadingState = new LoadingStateStore()

    mapIds: number[] = []

    results: TournoisResult[] = []

    mapIndex = 1

    constructor() {
        makeAutoObservable(this)
    }

    setResults(state: TournoisResult[]) {
        this.results = state
        const idsSet = new Set(state.map(({ mapId }) => mapId))
        this.mapIds = Array.from(idsSet)
    }

    async fetchResults() {
        this.loadingState.setIsLoading(true)
        const res = await fetchBackendJson<TournoisResult[], unknown>('/games/tournois')
        this.loadingState.setIsLoading(false)

        if (!res.ok) {
            return notifyError(getErrorMessage(res.json, 'Impossible de récuperer les scores'))
        }
        this.setResults(res.json)
    }

    get resultsRows(): ResultRow[] {
        const filteredResults = this.results.filter(({ mapId }) => this.mapIndex === mapId)
        const sortedResults = filteredResults.sort((a, b) => a.score - b.score)

        return sortedResults.map(({ id, jumps, score, time, userId }, index) => {
            const username = AppStore.users.get(userId)?.username ?? 'Introuvable 🤔'

            return { id, jumps, score, time, username, rank: index + 1 }
        })
    }

    setMapIndex(state: number) {
        this.mapIndex = state
    }
}
