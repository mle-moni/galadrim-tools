import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { notifyError, notifySuccess } from '../../utils/notification'
import { APPLICATION_JSON_HEADERS } from '../idea/createIdea/CreateIdeaStore'

interface ApiBreakActivity {
    id: number
    name: string
}

interface ApiBreakTime {
    id: number
    time: string
}

interface SelectOption<T extends string | number> {
    value: T
    label: string
}

export class GalabreakStore {
    activities: ApiBreakActivity[] = []
    times: ApiBreakTime[] = []

    activityLoadingStore = new LoadingStateStore()
    timeLoadingStore = new LoadingStateStore()

    activitiesValue: SelectOption<number>[] = []
    timesValue: SelectOption<number>[] = []

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
        const res = await fetchBackendJson<ApiBreakActivity[], unknown>('/galabreak/activities')
        this.activityLoadingStore.setIsLoading(false)
        if (!res.ok) {
            notifyError('Impossible de récupérer les activités')
            return
        }
        this.setActivities(res.json)
    }

    async fetchTimes() {
        this.timeLoadingStore.setIsLoading(true)
        const res = await fetchBackendJson<ApiBreakTime[], unknown>('/galabreak/times')
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

    get activitiesOptions() {
        return this.activities.map((activity) => ({
            value: activity.id,
            label: activity.name,
        }))
    }

    get timesOptions() {
        return this.times.map((time) => ({
            value: time.id,
            label: time.time,
        }))
    }

    setActivitiesValue(value: SelectOption<number>[]) {
        this.activitiesValue = value
    }

    setTimesValue(value: SelectOption<number>[]) {
        this.timesValue = value
    }

    get voteData() {
        return {
            activities: this.activitiesValue.map((activity) => activity.value),
            times: this.timesValue.map((time) => time.value),
        }
    }

    async submitVote() {
        const res = await fetchBackendJson<{ message: string }, unknown>(
            '/galabreak/votes',
            'POST',
            {
                headers: APPLICATION_JSON_HEADERS,
                body: JSON.stringify(this.voteData),
            }
        )

        if (!res.ok) {
            notifyError(getErrorMessage(res.json))
            return
        }

        this.setActivitiesValue([])
        this.setTimesValue([])

        notifySuccess(res.json.message)
    }
}
