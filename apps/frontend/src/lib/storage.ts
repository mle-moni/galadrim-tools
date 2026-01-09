function getLocalStorage(): Storage | null {
    if (typeof window === "undefined") return null;

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

export function readStoredBoolean(key: string): boolean | null {
    const storage = getLocalStorage();
    if (!storage) return null;

    try {
        const raw = storage.getItem(key);
        if (raw === null) return null;
        if (raw === "1") return true;
        if (raw === "0") return false;
        if (raw === "true") return true;
        if (raw === "false") return false;
        return null;
    } catch {
        return null;
    }
}
