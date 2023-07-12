import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { notifyError } from '../../utils/notification'

interface ApiBreakActivity {
    id: number
    name: string
}

interface ApiBreakTime {
    id: number
    time: string
}

export class GalabreakStore {
    activities: ApiBreakActivity[] = []
    times: ApiBreakTime[] = []

    activityLoadingStore = new LoadingStateStore()
    timeLoadingStore = new LoadingStateStore()

    constructor() {
        makeAutoObservable(this)
    }

    setActivities(activities: ApiBreakActivity[]) {
        this.activities = activities
    }

    setTimes(times: ApiBreakTime[]) {
        this.times = times
    }

    async fetchActivities() {
        this.activityLoadingStore.setIsLoading(true)
        const res = await fetchBackendJson<ApiBreakActivity[], unknown>('/api/galabreak/activities')
        this.activityLoadingStore.setIsLoading(false)
        if (!res.ok) {
            notifyError('Impossible de récupérer les activités')
            return
        }
        this.setActivities(res.json)
    }

    async fetchTimes() {
        this.timeLoadingStore.setIsLoading(true)
        const res = await fetchBackendJson<ApiBreakTime[], unknown>('/api/galabreak/times')
        this.timeLoadingStore.setIsLoading(false)
        if (!res.ok) {
            notifyError('Impossible de récupérer les times')
            return
        }
        this.setTimes(res.json)
    }

    async fetchAll() {
        await Promise.all([this.fetchActivities(), this.fetchTimes()])
    }

    get isLoading() {
        return this.activityLoadingStore.isLoading || this.timeLoadingStore.isLoading
    }
}
