import { makeAutoObservable } from "mobx";

const MIN_LOADING_TIME = 500; // in ms

export class LoadingStateStore {
    isLoading = false;
    startTime = Date.now();

    constructor() {
        makeAutoObservable(this);
    }

    realSetIsLoading(state: boolean) {
        this.isLoading = state;
    }

    setIsLoading(state: boolean, mode?: "useMinLoadingTime") {
        if (mode === undefined) {
            this.realSetIsLoading(state);
            return;
        }
        if (state) {
            this.startTime = Date.now();
            this.realSetIsLoading(true);
        } else {
            const endTime = Date.now();
            const diff = endTime - this.startTime;
            if (diff < MIN_LOADING_TIME) {
                setTimeout(() => {
                    this.realSetIsLoading(false);
                }, MIN_LOADING_TIME - diff);
            } else {
                this.realSetIsLoading(false);
            }
        }
    }
}
