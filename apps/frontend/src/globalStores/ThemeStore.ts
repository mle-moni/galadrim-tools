import type { ITheme } from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../api/fetch";
import { APPLICATION_JSON_HEADERS } from "../pages/idea/createIdea/CreateIdeaStore";
import { LoadingStateStore } from "../reusableComponents/form/LoadingStateStore";
import { DEFAULT_THEME, THEME_OPTIONS, type ThemeName } from "../theme/galadrimThemes";
import { notifyError, notifySuccess } from "../utils/notification";
import type { AuthStore } from "./AuthStore";

export type GaladrimTheme = Omit<ITheme, "id" | "createdAt" | "updatedAt">;
export type GaladrimThemeKey = keyof GaladrimTheme;

export const THEME_KEYS = Object.keys(DEFAULT_THEME) as GaladrimThemeKey[];
export const THEME_KEYS_WITHOUT_NAME = THEME_KEYS.slice(1);

export const FIELDS_TO_CSS_VARS: { [K in GaladrimThemeKey]: string | null } = {
    name: null,
    myEventsBg: "--my-events-bg",
    myEventsBorder: "--my-events-border",
    myEventsText: "--my-events-text",
    otherEventsBg: "--other-events-bg",
    otherEventsBorder: "--other-events-border",
    otherEventsText: "--other-events-text",
};

export const THEME_FIELDS_TO_LABEL: { [K in GaladrimThemeKey]: string } = {
    myEventsBg: "Couleur de fond de mes évènements",
    myEventsBorder: "Couleur de bordure de mes évènements",
    myEventsText: "Couleur de texte de mes évènements",
    otherEventsBg: "Couleur de fond des évènements des autres",
    otherEventsBorder: "Couleur de bordure des évènements des autres",
    otherEventsText: "Couleur de texte des évènements des autres",
    name: "Nom du thème",
};

export class ThemeStore {
    newTheme = { ...DEFAULT_THEME };

    theme: GaladrimTheme = { ...DEFAULT_THEME };

    private root: HTMLElement;

    loadingStore = new LoadingStateStore();

    themeKey: ThemeName | null = null;

    constructor(private authStore: AuthStore) {
        makeAutoObservable(this);
        this.root = document.querySelector(":root")!;
    }

    setThemeKey(key: ThemeName | null) {
        this.themeKey = key;
        if (!key) return;
        this.updateWithTheme(THEME_OPTIONS[key]);
    }

    updateStringField(field: GaladrimThemeKey, value: string) {
        this.newTheme[field] = value;
        this.updateCssVariable(field, value);
    }

    updateWithTheme(theme: (ITheme | GaladrimTheme) | null) {
        const updated = theme ?? DEFAULT_THEME;

        THEME_KEYS.forEach((key) => {
            this.newTheme[key] = updated[key];
            this.theme[key] = updated[key];
            this.updateCssVariable(key, updated[key]);
        });
    }

    updateCssVariable(key: GaladrimThemeKey, value: string) {
        const cssVariableName = FIELDS_TO_CSS_VARS[key];
        if (!cssVariableName) return;
        this.root.style.setProperty(cssVariableName, value);
    }

    async save() {
        const body = JSON.stringify(this.newTheme);
        this.loadingStore.setIsLoading(true);
        const res = await fetchBackendJson<{ theme: ITheme }, unknown>("/updateTheme", "POST", {
            body,
            headers: APPLICATION_JSON_HEADERS,
        });
        this.loadingStore.setIsLoading(false);

        if (res.ok) {
            this.authStore.setUserTheme(res.json.theme);
            notifySuccess("Thème mis à jour");
            return;
        }

        notifyError(getErrorMessage(res.json, "Erreur lors de la mise à jour du thème"));
    }
}
