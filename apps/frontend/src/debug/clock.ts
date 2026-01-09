import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebug } from "./DebugProvider";
import { parseSpoofedNow } from "./time";

export type ClockNowOptions = {
    baseDate?: Date;
};

export type Clock = {
    canSpoof: boolean;
    spoofNowRaw: string | null;
    getSpoofedNow: (opts?: ClockNowOptions) => Date | null;
    isSpoofed: (opts?: ClockNowOptions) => boolean;
    now: (opts?: ClockNowOptions) => Date;
    nowIso: (opts?: ClockNowOptions) => string;
    nowMs: (opts?: ClockNowOptions) => number;
};

export function useClock(): Clock {
    const debug = useDebug();

    const spoofNowRaw = debug.canSpoof && debug.enabled ? debug.nowRaw : null;

    const getSpoofedNow = useCallback(
        (opts?: ClockNowOptions) => {
            if (!spoofNowRaw) return null;
            return parseSpoofedNow(spoofNowRaw, opts?.baseDate);
        },
        [spoofNowRaw],
    );

    const isSpoofed = useCallback(
        (opts?: ClockNowOptions) => getSpoofedNow(opts) !== null,
        [getSpoofedNow],
    );

    const now = useCallback(
        (opts?: ClockNowOptions) => getSpoofedNow(opts) ?? new Date(),
        [getSpoofedNow],
    );

    const nowIso = useCallback((opts?: ClockNowOptions) => now(opts).toISOString(), [now]);
    const nowMs = useCallback((opts?: ClockNowOptions) => now(opts).getTime(), [now]);

    return useMemo(
        () => ({
            canSpoof: debug.canSpoof,
            spoofNowRaw,
            getSpoofedNow,
            isSpoofed,
            now,
            nowIso,
            nowMs,
        }),
        [debug.canSpoof, getSpoofedNow, isSpoofed, now, nowIso, nowMs, spoofNowRaw],
    );
}

export function useNow(opts?: { baseDate?: Date; intervalMs?: number }): Date {
    const clock = useClock();

    const baseDate = opts?.baseDate;
    const intervalMs = opts?.intervalMs ?? 60_000;

    const [current, setCurrent] = useState<Date>(() => clock.now({ baseDate }));

    const isSpoofed = clock.isSpoofed({ baseDate });

    useEffect(() => {
        setCurrent(clock.now({ baseDate }));

        if (isSpoofed) return;

        const timer = window.setInterval(() => setCurrent(clock.now({ baseDate })), intervalMs);
        return () => window.clearInterval(timer);
    }, [baseDate?.getTime(), clock, intervalMs, isSpoofed]);

    return current;
}
