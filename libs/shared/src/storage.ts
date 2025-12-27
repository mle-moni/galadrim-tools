export function readStoredBoolean(key: string): boolean | null {
    const storage = (globalThis as any).localStorage;
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
