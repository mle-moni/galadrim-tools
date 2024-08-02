import { makeAutoObservable } from "mobx";
import { fetchBackendJson } from "../../api/fetch";
import { LoadingStateStore } from "../../reusableComponents/form/LoadingStateStore";
import moment from "moment";

interface ApiTimeStatistic {
    time: string;
    username: string;
    id: number;
}

interface ApiAmountStatistic {
    amount: string;
    username: string;
    id: number;
}

interface ApiRoomStatistic {
    id: string;
    amount: string;
    time: string;
    username: string;
}

const formatTime = (seconds: string) => {
    const duration = moment.duration(seconds, "seconds");
    return `${duration.days()} jours ${duration.hours()} heures ${duration.minutes()} minutes`;
};

export class StatisticsStore {
    loadingState = new LoadingStateStore();

    public timePerUserData: ApiTimeStatistic[] = [];
    public amountPerUserData: ApiAmountStatistic[] = [];
    public roomData: ApiRoomStatistic[] = [];

    public showStatsFromAllTime = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowStatsFromAllTime(state: boolean) {
        this.showStatsFromAllTime = state;
    }

    setTimePerUserData(newTimePerUserData: ApiTimeStatistic[]) {
        this.timePerUserData = newTimePerUserData;
    }

    setAmountPerUserData(newAmountPerUserData: ApiAmountStatistic[]) {
        this.amountPerUserData = newAmountPerUserData;
    }

    setRoomData(newRoomData: ApiRoomStatistic[]) {
        this.roomData = newRoomData;
    }

    async fetchTimePerUser() {
        const qs = this.showStatsFromAllTime ? "" : "?days=30";
        const res = await fetchBackendJson<ApiTimeStatistic[], unknown>(`/statistics/time${qs}`);
        if (!res.ok) return;

        const userTimes = res.json;
        const formattedTimes = userTimes.map((userTime) => ({
            ...userTime,
            time: formatTime(userTime.time),
        }));
        this.setTimePerUserData(formattedTimes);
    }

    async fetchAmountPerUser() {
        const qs = this.showStatsFromAllTime ? "" : "?days=30";
        const res = await fetchBackendJson<ApiAmountStatistic[], unknown>(
            `/statistics/amount${qs}`,
        );
        if (res.ok) this.setAmountPerUserData(res.json);
    }

    async fetchRoomData() {
        const qs = this.showStatsFromAllTime ? "" : "?days=30";
        const res = await fetchBackendJson<ApiRoomStatistic[], unknown>(`/statistics/rooms${qs}`);

        if (!res.ok) return;
        const rooms = res.json;
        const formattedRooms = rooms.map((room) => ({
            ...room,
            time: formatTime(room.time),
        }));
        this.setRoomData(formattedRooms);
    }

    async fetchStats() {
        this.loadingState.setIsLoading(true);
        await Promise.all([
            this.fetchAmountPerUser(),
            this.fetchRoomData(),
            this.fetchTimePerUser(),
        ]);
        this.loadingState.setIsLoading(false);
    }

    async toggleStatsMode() {
        this.setShowStatsFromAllTime(!this.showStatsFromAllTime);
        this.fetchStats();
    }
}
