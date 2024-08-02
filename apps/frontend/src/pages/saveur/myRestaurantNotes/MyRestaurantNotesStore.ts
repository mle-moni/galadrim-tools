import { type INotes, NOTES_VALUES } from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson } from "../../../api/fetch";
import type { RestaurantsStore } from "../../../globalStores/RestaurantsStore";
import { LoadingStateStore } from "../../../reusableComponents/form/LoadingStateStore";
import { getHumanFormattedDay } from "../../idea/ideasUtils";
import type { NoteRow } from "./MyRestaurantNotesPage";

export class MyRestaurantNotesStore {
    loadingState = new LoadingStateStore();
    notes: INotes[] = [];

    constructor(private restaurantsStore: RestaurantsStore) {
        makeAutoObservable(this);
    }

    async fetchNotes() {
        this.loadingState.setIsLoading(true);
        const res = await fetchBackendJson<INotes[], unknown>("/notes/mine");
        this.loadingState.setIsLoading(false);

        if (res.ok) {
            this.setNotes(res.json);
        }
    }

    setNotes(state: INotes[]) {
        this.notes = state.sort((a, b) => +b.note - +a.note);
    }

    get rows(): NoteRow[] {
        return this.notes.map(({ id, note, restaurantId, updatedAt }) => {
            const found = this.restaurantsStore.restaurants.find(({ id }) => id === restaurantId);
            const restaurantName = found?.name ?? "UNKNOWN";

            return {
                id,
                note: NOTES_VALUES[note],
                restaurantName,
                updatedAt: getHumanFormattedDay(updatedAt),
            };
        });
    }
}
