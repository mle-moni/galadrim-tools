const STORAGE_KEYS = {
    UNLOCKED: "egg.platformer.unlocked",
    RETURN_TO: "egg.platformer.returnTo",
} as const;

export function unlockPlatformerEasterEgg(returnTo: string) {
    sessionStorage.setItem(STORAGE_KEYS.UNLOCKED, "1");
    sessionStorage.setItem(STORAGE_KEYS.RETURN_TO, returnTo);
}

export function isPlatformerEasterEggUnlocked() {
    return sessionStorage.getItem(STORAGE_KEYS.UNLOCKED) === "1";
}

export function getPlatformerEasterEggReturnTo() {
    return sessionStorage.getItem(STORAGE_KEYS.RETURN_TO);
}

export function clearPlatformerEasterEggReturnTo() {
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_TO);
}
