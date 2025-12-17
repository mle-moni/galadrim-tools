import { makeAutoObservable } from "mobx";
import { LoadingStateStore } from "../reusableComponents/form/LoadingStateStore";
import type { IRewind } from "@galadrim-tools/shared";
import { fetchBackendJson } from "../api/fetch";
import { getAdjectiveFunnyLabel, getAnimalFunnyLabel } from "../utils/rewind";

export class RewindStore {
    loadingState = new LoadingStateStore();

    rewind: Omit<IRewind, "userId" | "id" | "createdAt" | "updatedAt"> | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setRewind(rewind: IRewind) {
        this.rewind = rewind;
    }

    setFakeRewind() {
        this.rewind = {
            dailyChoiceCount: 0,
            totalPrice: 0,
            averagePrice: null,
            totalDistanceTravelled: 0,
            averageDistanceTravelled: null,
            userRank: 0,
            distanceRank: 0,
            wealthRank: 0,
            maxRank: 0,
            restaurantPerTag: {},
            personality: ["MICROBE", "INSIGNIFIANT"],
            restaurantAverageScore: null,
            favoriteRestaurantId: null,
            favoriteRestaurantCount: 0,
        };
    }

    async fetch() {
        this.loadingState.setIsLoading(true);
        const req = await fetchBackendJson<IRewind, unknown>("/rewind", "GET");
        this.loadingState.setIsLoading(false);
        if (req.ok) {
            this.setRewind(req.json);
            return;
        }

        this.setFakeRewind();
    }

    get rewindPositionsInfos() {
        if (!this.rewind) {
            return null;
        }

        return [
            {
                label: "Cette année vous avez mangé",
                value: this.rewind.dailyChoiceCount,
                unit: "fois",
                position: this.rewind.userRank,
                total: this.rewind.maxRank,
                duration: 4000,
            },
            {
                label: "Tout cela pour un total dépensé de",
                value: this.rewind.totalPrice,
                average: this.rewind.averagePrice,
                position: this.rewind.wealthRank,
                total: this.rewind.maxRank,
                unit: "€",
                conditionalLabel: getAdjectiveFunnyLabel(this.rewind.personality?.[1]),
            },
            {
                label: "Et pour manger, vous avez parcouru",
                value: this.rewind.totalDistanceTravelled
                    ? this.rewind.totalDistanceTravelled / 1000
                    : 0,
                average: this.rewind.averageDistanceTravelled,
                position: this.rewind.distanceRank,
                total: this.rewind.maxRank,
                averageUnit: "m",
                unit: "km",
                conditionalLabel: getAnimalFunnyLabel(this.rewind.personality?.[0]),
            },
        ];
    }

    get threeBestCategories() {
        if (!this.rewind) {
            return null;
        }

        const tagsWithCount = Object.entries(this.rewind.restaurantPerTag);

        if (tagsWithCount.length === 0) {
            return null;
        }

        return tagsWithCount.sort(([, countA], [, countB]) => countB - countA).slice(0, 3);
    }

    get rewindCategoriesFormattedData() {
        if (!this.rewind) {
            return null;
        }

        const colors = [
            "#d53e4f",
            "#f46d43",
            "#fdae61",
            "#fee08b",
            "#e6f598",
            "#abdda4",
            "#66c2a5",
            "#3288bd",
            "#897eb9",
        ];

        const tagsWithCount = Object.entries(this.rewind.restaurantPerTag);

        if (tagsWithCount.length === 0) {
            return null;
        }

        return tagsWithCount.map(([tag, count], index) => ({
            name: tag,
            color: colors[index % colors.length],
            children: [{ name: tag, count }],
        }));
    }

    get rewindPersonalityString() {
        if (!this.rewind || !this.rewind.personality) {
            return null;
        }

        return `${this.rewind.personality[0]} ${this.rewind.personality[1]}`;
    }

    get rewindImageName() {
        if (!this.rewind || !this.rewind.personality) {
            return null;
        }

        return `${this.rewind.personality[0]}_${this.rewind.personality[1]}.jpg`;
    }
}
