import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'

interface ApiTimeStatistic {
    time: string
    username: string
    id: number
}

interface ApiAmountStatistic {
    amount: string
    username: string
    id: number
}

interface ApiRoomStatistic {
    id: string
    amount: string
    time: string
    username: string
}

const formatTime = (time: string) => {
    const date = new Date(0)
    date.setSeconds(Number(time)) // specify value for SECONDS here
    return date.toISOString().slice(11, 19)
}

export class StatisticsStore {
    public timePerUserData: ApiTimeStatistic[] = []
    public amountPerUserData: ApiAmountStatistic[] = []
    public roomData: ApiRoomStatistic[] = []

    constructor() {
        this.fetchTimePerUser()
        this.fetchAmountPerUser()
        this.fetchRoomData()
        makeAutoObservable(this)
    }

    setTimePerUserData(newTimePerUserData: ApiTimeStatistic[]) {
        this.timePerUserData = newTimePerUserData
    }

    setAmountPerUserData(newAmountPerUserData: ApiAmountStatistic[]) {
        this.amountPerUserData = newAmountPerUserData
    }

    setRoomData(newRoomData: ApiRoomStatistic[]) {
        this.roomData = newRoomData
    }

    async fetchTimePerUser(isDays: boolean) {
        const qs = isDays ? '?days=30' : ''
        const res = await fetchBackendJson<ApiTimeStatistic[], unknown>('/statistics/time' + qs)
        if (!res.ok) return

        const userTimes = res.json
        const formattedTimes = userTimes.map((userTime) => ({
            ...userTime,
            time: formatTime(userTime.time),
        }))
        this.setTimePerUserData(formattedTimes)
    }

    async fetchAmountPerUser(isDays: boolean) {
        const qs = isDays ? '?days=30' : ''
        const res = await fetchBackendJson<ApiAmountStatistic[], unknown>('/statistics/amount' + qs)
        if (res.ok) this.setAmountPerUserData(res.json)
    }

    async fetchRoomData(isDays: boolean) {
        const qs = isDays ? '?days=30' : ''
        const res = await fetchBackendJson<ApiRoomStatistic[], unknown>('/statistics/rooms' + qs)

        if (!res.ok) return
        const rooms = res.json
        const formattedRooms = rooms.map((room) => ({
            ...room,
            time: formatTime(room.time),
        }))
        this.setRoomData(formattedRooms)
    }
}
