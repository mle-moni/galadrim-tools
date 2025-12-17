import { makeAutoObservable } from "mobx";
import { fetchBackendJson } from "../api/fetch";
import { LoadingStateStore } from "../reusableComponents/form/LoadingStateStore";
import { notifyError } from "../utils/notification";

export interface ApiBreakActivity {
    id: number;
    name: string;
}

export interface ApiBreakTime {
    id: number;
    time: string;
}

export interface ApiBreakVote {
    id: number;
    activities: ApiBreakActivity[];
    times: ApiBreakTime[];
    userId: number;
    createdAt: string;
}

export class GalabreakStore {
    active = false;

    votes: ApiBreakVote[] = [];
    activities: ApiBreakActivity[] = [];
    times: ApiBreakTime[] = [];

    votesLoadingStore = new LoadingStateStore();
    activitiesLoadingStore = new LoadingStateStore();
    timesLoadingStore = new LoadingStateStore();

    constructor() {
        makeAutoObservable(this);
    }

    enable() {
        this.active = true;
    }

    setActivities(activities: ApiBreakActivity[]) {
        this.activities = activities;
    }

    setTimes(times: ApiBreakTime[]) {
        this.times = times.sort((a, b) => a.time.localeCompare(b.time));
    }

    setVotes(votes: ApiBreakVote[]) {
        this.votes = votes;
    }

    async fetchActivities() {
        this.activitiesLoadingStore.setIsLoading(true);
        const res = await fetchBackendJson<ApiBreakActivity[], unknown>("/galabreak/activities");
        this.activitiesLoadingStore.setIsLoading(false);
        if (!res.ok) {
            notifyError("Impossible de récupérer les activités");
            return;
        }
        this.setActivities(res.json);
        this.enable();
    }

    async fetchTimes() {
        this.timesLoadingStore.setIsLoading(true);
        const res = await fetchBackendJson<ApiBreakTime[], unknown>("/galabreak/times");
        this.timesLoadingStore.setIsLoading(false);
        if (!res.ok) {
            notifyError("Impossible de récupérer les times");
            return;
        }
        this.setTimes(res.json);
    }

    async fetchVotes() {
        this.votesLoadingStore.setIsLoading(true);
        const res = await fetchBackendJson<ApiBreakVote[], unknown>("/galabreak/votes");
        this.votesLoadingStore.setIsLoading(false);
        if (!res.ok) {
            notifyError("Impossible de récupérer les votes");
            return;
        }
        this.setVotes(res.json);
    }

    async fetchAll() {
        await Promise.all([this.fetchActivities(), this.fetchTimes(), this.fetchVotes()]);
    }

    get isLoading() {
        return (
            this.activitiesLoadingStore.isLoading ||
            this.timesLoadingStore.isLoading ||
            this.votesLoadingStore.isLoading
        );
    }

    get activitiesOptions() {
        return this.activities.map((activity) => ({
            value: activity.id,
            label: activity.name,
        }));
    }

    get timesOptions() {
        return this.times.map((time) => ({
            value: time.id,
            label: time.time,
        }));
    }

    get activityVotes() {
        const votes = new Map<number, ApiBreakVote[]>();

        this.votes.forEach((vote) => {
            vote.activities.forEach((activity) => {
                const currentVotes = votes.get(activity.id) || [];
                currentVotes.push(vote);
                votes.set(activity.id, currentVotes);
            });
        });

        return Array.from(votes.entries());
    }

    get timeVotes() {
        const votes = new Map<number, ApiBreakVote[]>();

        this.votes.forEach((vote) => {
            vote.times.forEach((time) => {
                const currentVotes = votes.get(time.id) || [];
                currentVotes.push(vote);
                votes.set(time.id, currentVotes);
            });
        });

        return Array.from(votes.entries());
    }
}
