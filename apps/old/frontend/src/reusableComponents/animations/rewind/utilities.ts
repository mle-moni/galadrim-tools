import { useCallback, useEffect, useRef } from "react";

export const range = (start: number, end?: number, step = 1) => {
    const output = [];
    let newStart = start;
    let newEnd = end;
    if (typeof newEnd === "undefined") {
        newEnd = newStart;
        newStart = 0;
    }
    for (let i = newStart; i < newEnd; i += step) {
        output.push(i);
    }
    return output;
};

export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

// Utility helper for random number generation
export const useRandomInterval = (callback: () => void, minDelay: number, maxDelay: number) => {
    const timeoutId = useRef<number | null>(null);
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        const isEnabled = typeof minDelay === "number" && typeof maxDelay === "number";
        if (isEnabled) {
            const handleTick = () => {
                const nextTickAt = random(minDelay, maxDelay);
                timeoutId.current = window.setTimeout(() => {
                    savedCallback.current();
                    handleTick();
                }, nextTickAt);
            };
            handleTick();
        }
        return () => window.clearTimeout(timeoutId.current ?? undefined);
    }, [minDelay, maxDelay]);
    const cancel = useCallback(() => {
        window.clearTimeout(timeoutId.current ?? undefined);
    }, []);
    return cancel;
};
