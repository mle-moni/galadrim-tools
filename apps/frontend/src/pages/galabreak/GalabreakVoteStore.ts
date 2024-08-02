import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import type { GalabreakStore } from "../../globalStores/GalabreakStore";
import { notifyError, notifySuccess } from "../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../idea/createIdea/CreateIdeaStore";

interface SelectOption<T extends string | number> {
    value: T;
    label: string;
}

export class GalabreakVoteStore {
    activitiesValue: SelectOption<number>[] = [];
    timesValue: SelectOption<number>[] = [];

    constructor(private galabreakStore: GalabreakStore) {
        makeAutoObservable(this);
    }

    get activitiesOptions() {
        return this.galabreakStore.activities.map((activity) => ({
            value: activity.id,
            label: activity.name,
        }));
    }

    get timesOptions() {
        return this.galabreakStore.times.map((time) => ({
            value: time.id,
            label: time.time,
        }));
    }

    setActivitiesValue(value: SelectOption<number>[]) {
        this.activitiesValue = value;
    }

    setTimesValue(value: SelectOption<number>[]) {
        this.timesValue = value;
    }

    get voteData() {
        return {
            activities: this.activitiesValue.map((activity) => activity.value),
            times: this.timesValue.map((time) => time.value),
        };
    }

    async submitVote() {
        const res = await fetchBackendJson<{ message: string }, unknown>("/galabreak/votes", "POST", {
            headers: APPLICATION_JSON_HEADERS,
            body: JSON.stringify(this.voteData),
        });

        if (!res.ok) {
            notifyError(getErrorMessage(res.json));
            return;
        }

        this.setActivitiesValue([]);
        this.setTimesValue([]);

        notifySuccess(res.json.message);
    }

    get isSubmitDisabled() {
        return this.activitiesValue.length === 0 || this.timesValue.length === 0;
    }
}
