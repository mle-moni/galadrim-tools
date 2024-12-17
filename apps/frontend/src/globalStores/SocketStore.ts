import type {
    ApiRoomReservation,
    IIdea,
    INotification,
    IRestaurant,
    IReview,
    ITag,
} from "@galadrim-tools/shared";
import { type Socket, io } from "socket.io-client";
import { getSocketApiUrl } from "../api/fetch";
import type { UserData } from "../api/galadrimeurs";
import type { TournoisResult } from "../pages/games/tournois/TournoisResultsStore";
import { queryClient } from "../queryClient";
import { notifyError, notifySuccess } from "../utils/notification";
import { AppStore } from "./AppStore";

export class SocketStore {
    private _socket: Socket | null = null;

    get socket() {
        if (!this._socket) {
            throw new Error("you must call connect() before accessing to socket");
        }
        return this._socket;
    }

    connect() {
        if (this._socket) return;
        this._socket = io(getSocketApiUrl(), { transports: ["websocket"] });
        this.setupEvents();
    }

    disconnect() {
        this.socket.emit("logout");
        this.socket.removeAllListeners();
        this.socket.close();
        this._socket = null;
    }

    setupEvents() {
        this.socket.on("auth", () => this.socketAuth());
        this.socket.on("error", (msg) => this.error(msg));
        this.socket.on("success", (msg) => this.success(msg));
        this.socket.on("createTag", (restaurant) => this.createTag(restaurant));
        this.socket.on("createRestaurant", (restaurant) => this.createRestaurant(restaurant));
        this.socket.on("updateRestaurant", (restaurant) => this.updateRestaurant(restaurant));
        this.socket.on("deleteRestaurant", ({ id }: { id: number }) => this.deleteRestaurant(id));
        this.socket.on("chooseRestaurant", (restaurant) => this.chooseRestaurant(restaurant));
        this.socket.on("fetchAll", () => AppStore.fetchAll());
        this.socket.on("updateUser", (userInfo) => this.updateUser(userInfo));
        this.socket.on("updateRights", (rights) => this.updateRights(rights));
        this.socket.on("createIdea", (idea) => this.createOrUpdateIdea(idea));
        this.socket.on("updateIdea", (idea) => this.createOrUpdateIdea(idea));
        this.socket.on("deleteIdea", (ideaId) => this.deleteIdea(ideaId));
        this.socket.on("createRestaurantReview", (idea) =>
            this.createOrUpdateRestaurantReview(idea),
        );
        this.socket.on("updateRestaurantReview", (idea) =>
            this.createOrUpdateRestaurantReview(idea),
        );
        this.socket.on("deleteRestaurantReview", (ideaId) => this.deleteRestaurantReview(ideaId));
        this.socket.on("notification", (notification) => this.addNotification(notification));
        this.socket.on("game.tournois.newResult", (newResult) => this.addTournoisResult(newResult));
        this.socket.on("deleteRoomReservation", (reservationId) =>
            this.deleteRoomReservation(reservationId),
        );
        this.socket.on("updateRoomReservation", (reservation) =>
            this.updateRoomReservation(reservation),
        );
        this.socket.on("createRoomReservation", (reservation) =>
            this.createRoomReservation(reservation),
        );
    }

    socketAuth() {
        this.socket.emit("auth", {
            userId: AppStore.authStore.user.id,
            socketToken: AppStore.authStore.user.socketToken,
        });
    }

    error(msg: string) {
        notifyError(msg);
    }

    success(msg: string) {
        notifySuccess(msg);
    }

    createRestaurant(restaurant: IRestaurant) {
        AppStore.saveurStore.restaurantsStore.addRestaurant(restaurant);
    }

    createTag(tag: ITag) {
        AppStore.saveurStore.tagsStore.pushTag(tag);
    }

    updateRestaurant(restaurant: IRestaurant) {
        AppStore.saveurStore.restaurantsStore.editRestaurant(restaurant);
    }

    chooseRestaurant(restaurant: IRestaurant) {
        AppStore.authStore.chooseRestaurant(restaurant);
    }

    deleteRestaurant(id: number) {
        AppStore.saveurStore.restaurantsStore.deleteRestaurant(id);
    }

    updateUser(userInfo: UserData) {
        AppStore.updateUser(userInfo);
    }

    updateRights(rights: number) {
        AppStore.authStore.updateRights(rights);
    }

    createOrUpdateIdea(idea: IIdea) {
        AppStore.ideaStore.createOrUpdateIdea(idea);
    }

    deleteIdea(id: number) {
        AppStore.ideaStore.removeIdeaById(id);
    }

    createOrUpdateRestaurantReview(review: IReview) {
        AppStore.saveurStore.restaurantsStore.createOrUpdateReview(review);
    }

    deleteRestaurantReview(id: number) {
        AppStore.saveurStore.restaurantsStore.removeReviewById(id);
    }

    addNotification(notification: INotification) {
        AppStore.authStore.addNotification(notification);
    }

    addTournoisResult(newResult: TournoisResult) {
        AppStore.tournoisResultsStore?.addResult(newResult);
    }

    deleteRoomReservation(reservationId: number) {
        queryClient.setQueriesData<ApiRoomReservation[]>(
            { queryKey: ["office-rooms-reservations"] },
            (old) => {
                if (!old) return old;

                return old.filter((r) => r.id !== reservationId);
            },
        );
    }

    updateRoomReservation(reservation: ApiRoomReservation) {
        queryClient.setQueriesData<ApiRoomReservation[]>(
            { queryKey: ["office-rooms-reservations"] },
            (old) => {
                if (!old) return old;

                return old.map((r) => (r.id === reservation.id ? reservation : r));
            },
        );
    }

    createRoomReservation(reservation: ApiRoomReservation) {
        queryClient.setQueriesData<ApiRoomReservation[]>(
            { queryKey: ["office-rooms-reservations"] },
            (old) => {
                if (!old) return [reservation];

                return [...old, reservation];
            },
        );
    }
}
