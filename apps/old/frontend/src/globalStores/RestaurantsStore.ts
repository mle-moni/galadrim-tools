import type { IRestaurant, IReview } from "@galadrim-tools/shared";
import Fuse from "fuse.js";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../api/fetch";
import { APPLICATION_JSON_HEADERS } from "../pages/idea/createIdea/CreateIdeaStore";
import {
    MINIMUM_VOTES_BEFORE_RELEVANT,
    getRestaurantsScore,
} from "../pages/saveur/restaurantsLists/getRestaurantScore";
import { LoadingStateStore } from "../reusableComponents/form/LoadingStateStore";
import { notifyError } from "../utils/notification";
import { RestaurantReviewsStore } from "./RestaurantReviewsStore";

const fuseSettings: Fuse.IFuseOptions<IRestaurant> = {
    includeScore: true,
    keys: ["name", "description", "tags.name"],
};
export class RestaurantsStore {
    loadingState = new LoadingStateStore();

    private _fuseInstance: Fuse<IRestaurant> = new Fuse([], fuseSettings);

    restaurants: IRestaurant[] = [];

    search = "";

    restaurantClicked?: IRestaurant = undefined;

    reviewsStore = new RestaurantReviewsStore();

    constructor() {
        makeAutoObservable(this);
    }

    setRestaurants(restaurants: IRestaurant[]) {
        this.restaurants = restaurants;
        this.refreshFuse();
    }

    refreshFuse() {
        this._fuseInstance = new Fuse(this.restaurants, fuseSettings);
    }

    async fetch() {
        this.loadingState.setIsLoading(true);
        const req = await fetchBackendJson<IRestaurant[], unknown>("/restaurants", "GET");
        this.loadingState.setIsLoading(false);
        if (req.ok) {
            this.setRestaurants(req.json);
            return;
        }
    }

    setSearch(str: string) {
        this.search = str;
    }

    get fuseInstance() {
        return this._fuseInstance;
    }

    setRestaurantClicked(resto?: IRestaurant) {
        this.restaurantClicked = resto;
        if (resto) {
            this.setSearch("");
        }
    }

    removeReviewById(reviewId: number) {
        const foundRestaurant = this.restaurants.find(({ reviews }) =>
            reviews.find(({ id }) => id === reviewId),
        );

        if (!foundRestaurant) return;

        foundRestaurant.reviews = foundRestaurant.reviews.filter(({ id }) => id !== reviewId);
    }

    createOrUpdateReview(review: IReview) {
        const restaurant = this.restaurants.find(({ id }) => id === review.restaurantId);
        if (!restaurant) {
            return;
        }
        const foundReview = restaurant.reviews.find(({ id }) => id === review.id);
        if (foundReview) {
            foundReview.comment = review.comment;
            foundReview.image = review.image;
            return;
        }
        restaurant.reviews.push(review);
    }

    addRestaurant(restaurant: IRestaurant) {
        this.restaurants.push(restaurant);
        this.refreshFuse();
    }

    editRestaurant(restaurant: IRestaurant) {
        const restaurantFound = this.restaurants.find(({ id }) => restaurant.id === id);
        if (!restaurantFound) {
            this.addRestaurant(restaurant);
            return;
        }
        restaurantFound.name = restaurant.name;
        restaurantFound.description = restaurant.description;
        restaurantFound.lat = restaurant.lat;
        restaurantFound.lng = restaurant.lng;
        restaurantFound.averagePrice = restaurant.averagePrice;
        restaurantFound.userId = restaurant.userId;
        restaurantFound.websiteLink = restaurant.websiteLink;
        restaurantFound.tags = restaurant.tags.map(({ id, name }) => ({
            id,
            name,
        }));
        restaurantFound.notes = restaurant.notes.map(
            ({ id, note, restaurantId, userId, updatedAt }) => ({
                id,
                note,
                restaurantId,
                userId,
                updatedAt,
            }),
        );
        restaurantFound.choices = restaurant.choices;
        if (restaurant.image === null) {
            restaurantFound.image = null;
            return;
        }
        restaurantFound.image = { ...restaurant.image };
        restaurantFound.reviews = restaurant.reviews ?? [];
        this.refreshFuse();
    }

    getRestaurant(restaurantId: IRestaurant["id"]) {
        return this.restaurants.find((restaurant) => restaurant.id === restaurantId);
    }

    deleteRestaurant(id: number) {
        this.restaurants = this.restaurants.filter((resto) => id !== resto.id);
    }

    get scores() {
        return getRestaurantsScore(this.restaurants);
    }

    get bestRestaurants() {
        const sortedScores = this.scores.sort(
            (restaurantA, restaurantB) => restaurantB.score - restaurantA.score,
        );
        const bestFive = sortedScores.slice(0, 5);

        return bestFive.map(({ restaurant }) => restaurant);
    }

    get worstRestaurants() {
        const sortedScores = this.scores
            .filter(({ restaurant: { notes } }) => notes.length >= MINIMUM_VOTES_BEFORE_RELEVANT)
            .sort((restaurantA, restaurantB) => restaurantA.score - restaurantB.score);
        const worstFive = sortedScores.slice(0, 5);

        return worstFive.map(({ restaurant }) => restaurant);
    }

    get newRestaurants(): IRestaurant[] {
        const restaurants = [...this.restaurants];
        const sortedById = restaurants.sort((a, b) => b.id - a.id);
        const newestRestaurants = sortedById.slice(0, 5);

        return newestRestaurants;
    }

    get leastExpensiveRestaurants(): IRestaurant[] {
        const restaurants = [
            ...this.restaurants.filter(({ averagePrice }) => averagePrice !== null),
        ];
        const sortedRestaurants = restaurants.sort((a, b) => a.averagePrice! - b.averagePrice!);

        return sortedRestaurants;
    }

    get mostExpensiveRestaurants(): IRestaurant[] {
        const restaurants = [
            ...this.restaurants.filter(({ averagePrice }) => averagePrice !== null),
        ];
        const sortedRestaurants = restaurants.sort((a, b) => b.averagePrice! - a.averagePrice!);

        return sortedRestaurants;
    }

    get restaurantChoices(): IRestaurant[] {
        return this.restaurants
            .filter((restaurant) => restaurant.choices.length > 0)
            .sort((a, b) => b.choices.length - a.choices.length);
    }

    async chooseRestaurant(id: number) {
        const res = await fetchBackendJson<IRestaurant, unknown>(
            "/createOrUpdateRestaurantChoice",
            "POST",
            {
                body: JSON.stringify({
                    restaurantId: id,
                }),
                headers: APPLICATION_JSON_HEADERS,
            },
        );
        if (res.ok) {
            return;
        }

        notifyError(getErrorMessage(res.json, "Impossible de choisir le restaurant, bizarre"));
    }
}
