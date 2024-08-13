import type { GaladrimTheme } from "../globalStores/ThemeStore";

export const DEFAULT_THEME: GaladrimTheme = {
    name: "Sobre",
    myEventsBg: "#0d022a",
    myEventsBorder: "#0d022a",
    myEventsText: "#ffffff",
    otherEventsBg: "#D0D5DC",
    otherEventsBorder: "#D0D5DC",
    otherEventsText: "#0d022a",
};

export const BLUE_THEME: GaladrimTheme = {
    name: "Bleuet",
    myEventsBg: "#010B1E",
    myEventsBorder: "#010B1E",
    myEventsText: "#ffffff",
    otherEventsBg: "#DFE8FC",
    otherEventsBorder: "#DFE8FC",
    otherEventsText: "#0d022a",
};

export const ORANGE_THEME: GaladrimTheme = {
    name: "Abricot",
    myEventsBg: "#030B1D",
    myEventsBorder: "#030B1D",
    myEventsText: "#ffffff",
    otherEventsBg: "#F9DCBD",
    otherEventsBorder: "#F9DCBD",
    otherEventsText: "#030B1D",
};

export const THEME_OPTIONS = {
    DEFAULT_THEME,
    LITTLE_BLUE_THEME: BLUE_THEME,
    LITTLE_ORANGE_THEME: ORANGE_THEME,
};

export type ThemeName = keyof typeof THEME_OPTIONS;

export const THEME_OPTIONS_KEYS = Object.keys(THEME_OPTIONS) as ThemeName[];
