import type {
    ApiError,
    ApiNotification,
    INotification,
    IRestaurant,
    ITheme,
    IUserData,
} from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../api/fetch";
import { notifyError, notifySuccess } from "../utils/notification";
import { AppStore } from "./AppStore";
import { ThemeStore } from "./ThemeStore";

const CHANGE_PASSWORD_INTENT = "changePassword" as const;

export class AuthStore {
    public connected = false;

    private _user: IUserData | null = null;

    public email = localStorage.getItem("email") || "";

    public password = "";

    public image: File | null = null;

    public imageSrc: string | null = null;

    public themeStore = new ThemeStore(this);

    constructor() {
        makeAutoObservable(this);
    }

    async init() {
        const res = await fetchBackendJson<IUserData, ApiError>("/me");
        if (res.ok) {
            this.setUser(res.json);
            AppStore.socketStore.connect();
        }
    }

    get canAuthenticate() {
        return this.email !== "" && this.password !== "";
    }

    get canChangePassword() {
        return this.password !== "";
    }

    async login() {
        const data = new FormData();
        if (!this.canAuthenticate) return;
        data.append("email", this.email);
        data.append("password", this.password);
        const res = await fetchBackendJson<IUserData, ApiError>("/login", "POST", {
            body: data,
        });
        if (!res.ok) {
            notifyError("Adresse mail ou mot de passe incorrect");
            return;
        }
        this.setUser(res.json);
        this.setPassword("");
        AppStore.socketStore.connect();
        const params = new URLSearchParams(location.search);
        notifySuccess(`Bienvenue ${res.json.username} !`);
        const redirection = params.get("redirect");
        if (redirection !== null) {
            if (redirection.startsWith("http")) {
                location.replace(redirection);
            } else {
                location.replace(window.atob(redirection));
            }
        }
        if (params.get("intent") === CHANGE_PASSWORD_INTENT) {
            AppStore.navigate("/changePassword");
        } else {
            AppStore.navigate("/");
        }
    }

    async logout() {
        await fetchBackendJson("/logout", "POST");
        this.setUser(null);
        AppStore.socketStore.disconnect();
        AppStore.navigate("/login");
        notifySuccess("Vous êtes bien déconnecté");
    }

    setUser(user: IUserData | null) {
        this.themeStore.updateWithTheme(user?.theme ?? null);
        if (!user) {
            this._user = null;
            this.connected = false;
            return;
        }
        this._user = user;
        this.connected = true;
    }

    setOfficeId(officeId: number | null) {
        this.user.officeId = officeId;
    }

    setEmail(email: string) {
        this.email = email;
        localStorage.setItem("email", email);
    }

    setPassword(password: string) {
        this.password = password;
    }

    get user() {
        if (!this._user) throw new Error("use this computed only after login");
        return this._user;
    }

    get userOrNull() {
        return this._user ?? null;
    }

    async getOtp() {
        const data = new FormData();
        data.append("email", this.email);
        const res = await fetchBackendJson<ApiNotification, unknown>("/getOtp", "POST", {
            body: data,
        });
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, `Impossible d'envoyer un mail a cette adresse, bizarre`),
            );
        }
        notifySuccess(res.json.notification);
        AppStore.navigate(`/login?intent=${CHANGE_PASSWORD_INTENT}`);
    }

    async changePassword() {
        const data = new FormData();
        data.append("password", this.password);
        const res = await fetchBackendJson<ApiNotification, unknown>("/changePassword", "POST", {
            body: data,
        });
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, "Impossible de mettre à jour le mot de passe, bizarre"),
            );
        }
        notifySuccess(res.json.notification);
        this.setPassword("");
        AppStore.navigate("/");
    }

    setUploadedImage(input: HTMLInputElement) {
        const image: File | null = input.files && input.files.length >= 1 ? input.files[0] : null;
        this.setImage(image);
    }

    setImage(image: File | null) {
        this.image = image;
        if (image) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        this.setImageSrc(reader.result.toString());
                    }
                },
                false,
            );
            reader.readAsDataURL(image);
        }
    }

    setImageSrc(state: string | null) {
        this.imageSrc = state;
    }

    async updateProfile(username: string, email: string) {
        const data = new FormData();
        data.append("email", email);
        data.append("username", username);
        if (this.image) {
            data.append("image", this.image);
        }

        const res = await fetchBackendJson<unknown, unknown>("/updateProfile", "POST", {
            body: data,
        });
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, "Impossible de mettre à jour le profil, bizarre..."),
            );
        }
        this.updateProfileData(username, email);
        notifySuccess("Profil mis à jour !");
    }

    updateProfileData(username: string, email: string) {
        this.user.username = username;
        this.user.email = email;
        if (this.imageSrc) {
            this.user.imageUrl = this.imageSrc;
        }
    }

    updateRights(rights: number) {
        this.user.rights = rights;
    }

    chooseRestaurant(restaurant: IRestaurant) {
        if (!this._user) throw new Error("use this computed only after login");
        if (restaurant.choices.includes(this._user.id)) {
            this._user.dailyChoice = restaurant.id;
            return;
        }
        if (this._user.dailyChoice === restaurant.id) {
            this._user.dailyChoice = null;
        }
    }

    setUserNotificationSetting(notificationsSettings: number) {
        this.user.notificationsSettings = notificationsSettings;
    }

    addNotification(notification: INotification) {
        this.user.notifications.unshift(notification);
    }

    readNotifications() {
        this.user.notifications.forEach((notification) => {
            notification.read = true;
        });
    }

    setUserTheme(theme: ITheme) {
        this.user.theme = theme;
        this.themeStore.updateWithTheme(theme);
    }
}
