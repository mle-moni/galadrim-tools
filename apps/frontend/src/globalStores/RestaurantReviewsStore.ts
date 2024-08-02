import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../api/fetch";
import { ImageInputStore } from "../reusableComponents/form/ImageInputStore";
import { LoadingStateStore } from "../reusableComponents/form/LoadingStateStore";
import { TextFieldStore } from "../reusableComponents/form/TextFieldStore";
import { notifyError, notifySuccess } from "../utils/notification";

export class RestaurantReviewsStore {
    restaurantId: number | null = null;

    loadingStore = new LoadingStateStore();

    comment = new TextFieldStore();

    imageStore = new ImageInputStore();

    constructor() {
        makeAutoObservable(this);
    }

    showReviewsForRestaurant(restaurantId: number | null) {
        this.restaurantId = restaurantId;
    }

    getPayload() {
        const data = new FormData();

        data.append("comment", this.comment.text);

        if (this.imageStore.image) {
            data.append("image", this.imageStore.image);
        }

        return data;
    }

    get submitDisabled() {
        return (
            this.comment.text === "" || this.loadingStore.isLoading || this.restaurantId === null
        );
    }

    async addReview() {
        const data = this.getPayload();

        if (this.submitDisabled) return;

        this.loadingStore.setIsLoading(true);
        const res = await fetchBackendJson<{ game: { id: number } }, unknown>(
            `/restaurants/${this.restaurantId}/reviews`,
            "POST",
            {
                body: data,
            },
        );
        this.loadingStore.setIsLoading(false);

        if (res.ok) {
            notifySuccess("Avis publié !");
            this.reset();
        } else {
            notifyError(getErrorMessage(res.json, `Impossible de publier l'avis, bizarre...`));
        }
    }

    reset() {
        this.comment.reset();
        this.imageStore.setImageSrc(null);
        this.imageStore.setImage(null);
    }
}
