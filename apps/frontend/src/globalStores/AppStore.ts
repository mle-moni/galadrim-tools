import { makeAutoObservable } from "mobx";
import type { NavigateFunction } from "react-router-dom";
import { type UserData, fetchUsers } from "../api/galadrimeurs";
import type { TournoisResultsStore } from "../pages/games/tournois/TournoisResultsStore";
import { IdeasStore } from "../pages/idea/IdeasStore";
import { AuthStore } from "./AuthStore";
import { GalabreakStore } from "./GalabreakStore";
import { NotificationStore } from "./NotificationStore";
import { SaveurStore } from "./SaveurStore";
import { SocketStore } from "./SocketStore";

export class MainStore {
    private _navigate: NavigateFunction | null = null;

    public appIsReady = false;

    public users = new Map<number, UserData>();

    public usersArray: UserData[] = [];

    public saveurStore = new SaveurStore();

    public notification = new NotificationStore();

    public authStore = new AuthStore();

    public socketStore = new SocketStore();

    public ideaStore = new IdeasStore();

    public galabreakStore = new GalabreakStore();

    public tournoisResultsStore: TournoisResultsStore | null = null;

    constructor() {
        makeAutoObservable(this);
        this.init();
    }

    public setUsersMap(state: Map<number, UserData>) {
        this.users = state;
    }

    public setUsersArray(state: UserData[]) {
        this.usersArray = state;
    }

    public setAppReady(state: boolean) {
        this.appIsReady = state;
    }

    public setNavigation(navigate: NavigateFunction) {
        this._navigate = navigate;
    }

    public navigate(path: string) {
        if (!this._navigate) throw new Error("You must set navigation first");
        this._navigate(path);
    }

    async init() {
        const [users] = await Promise.all([fetchUsers(), this.authStore.init()]);
        this.setUsersArray(users);
        this.setUsersMap(new Map<number, UserData>(users.map((user) => [user.id, user])));
        this.setAppReady(true);
    }

    async fetchAll() {
        this.saveurStore.init();
        const users = await fetchUsers();
        this.setUsersMap(new Map<number, UserData>(users.map((user) => [user.id, user])));
    }

    addUser(user: UserData) {
        this.users.set(user.id, user);
    }

    updateUser(user: UserData) {
        const userFound = this.users.get(user.id);
        if (!userFound) {
            this.addUser(user);
            return;
        }
        userFound.username = user.username;
        userFound.imageUrl = user.imageUrl;
    }

    setTournoisResultsStore(state: TournoisResultsStore | null) {
        this.tournoisResultsStore = state;
    }

    get userOptions() {
        return this.usersArray.map((user) => ({
            value: user.id,
            label: user.username,
        }));
    }
}

export const AppStore = new MainStore();
