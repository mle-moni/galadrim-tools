import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { isLocalDebugHost } from "./isLocalDebugHost";

const DEBUG_STATE_KEY = "galatools.debug";
const SCHEDULER_DEBUG_STATE_KEY = "scheduler.debug";

type DebugState = {
    enabled: boolean;
    nowRaw: string | null;
    nowDraft: string;
};

type DebugContextValue = DebugState & {
    canSpoof: boolean;
    setEnabled: (enabled: boolean) => void;
    setNowDraft: (draft: string) => void;
    applyNowDraft: () => void;
    clearNow: () => void;
};

const DebugContext = createContext<DebugContextValue | null>(null);

function defaultState(): DebugState {
    return { enabled: false, nowRaw: null, nowDraft: "" };
}

function loadFromSessionStorage<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.sessionStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function saveToSessionStorage(key: string, value: unknown) {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function removeFromSessionStorage(key: string) {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.removeItem(key);
    } catch {
        // ignore
    }
}

function shouldPersist(state: DebugState) {
    return state.enabled || Boolean(state.nowRaw) || state.nowDraft.trim().length > 0;
}

function loadDebugState(canSpoof: boolean): DebugState {
    if (!canSpoof) return defaultState();

    const stored = loadFromSessionStorage<
        Partial<DebugState> & Partial<{ fakeNowRaw: unknown; fakeNowDraft: unknown }>
    >(DEBUG_STATE_KEY);

    if (stored) {
        const nowRaw =
            typeof stored.nowRaw === "string"
                ? stored.nowRaw
                : typeof stored.fakeNowRaw === "string"
                  ? stored.fakeNowRaw
                  : null;

        const nowDraft =
            typeof stored.nowDraft === "string"
                ? stored.nowDraft
                : typeof stored.fakeNowDraft === "string"
                  ? stored.fakeNowDraft
                  : nowRaw ?? "";

        const enabled = Boolean(stored.enabled ?? Boolean(nowRaw));

        return { enabled, nowRaw, nowDraft };
    }

    const scheduler =
        loadFromSessionStorage<Partial<{ devNowRaw: unknown }>>(SCHEDULER_DEBUG_STATE_KEY);
    const devNowRaw = typeof scheduler?.devNowRaw === "string" ? scheduler.devNowRaw : null;
    if (devNowRaw) {
        return { enabled: true, nowRaw: devNowRaw, nowDraft: devNowRaw };
    }

    return defaultState();
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
    const canSpoof = isLocalDebugHost();
    const [state, setState] = useState<DebugState>(() => loadDebugState(canSpoof));

    useEffect(() => {
        if (!canSpoof) return;

        if (!shouldPersist(state)) {
            removeFromSessionStorage(DEBUG_STATE_KEY);
            return;
        }

        saveToSessionStorage(DEBUG_STATE_KEY, state);
    }, [canSpoof, state]);

    const setEnabled = useCallback((enabled: boolean) => {
        setState((prev) => ({ ...prev, enabled }));
    }, []);

    const setNowDraft = useCallback((draft: string) => {
        setState((prev) => ({ ...prev, nowDraft: draft }));
    }, []);

    const applyNowDraft = useCallback(() => {
        setState((prev) => {
            const trimmed = prev.nowDraft.trim();
            if (!trimmed) return { enabled: false, nowRaw: null, nowDraft: "" };
            return { enabled: true, nowRaw: trimmed, nowDraft: trimmed };
        });
    }, []);

    const clearNow = useCallback(() => {
        setState({ enabled: false, nowRaw: null, nowDraft: "" });
    }, []);

    const value = useMemo<DebugContextValue>(
        () => ({
            ...state,
            canSpoof,
            setEnabled,
            setNowDraft,
            applyNowDraft,
            clearNow,
        }),
        [applyNowDraft, canSpoof, clearNow, setEnabled, setNowDraft, state],
    );

    return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebug() {
    const ctx = useContext(DebugContext);
    if (!ctx) throw new Error("useDebug must be used within DebugProvider");
    return ctx;
}
