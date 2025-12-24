export function parseDebugNow(raw: string, baseDate?: Date): Date | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const base = baseDate ?? new Date();

    const hhmmMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
    if (hhmmMatch) {
        const hours = Number(hhmmMatch[1]);
        const minutes = Number(hhmmMatch[2]);
        const next = new Date(base);
        next.setHours(hours, minutes, 0, 0);
        return next;
    }

    return new Date(trimmed);
}

export function parseSpoofedNow(raw: string, baseDate?: Date): Date | null {
    return parseDebugNow(raw, baseDate);
}

export function parseFakeNow(raw: string, baseDate?: Date): Date | null {
    return parseDebugNow(raw, baseDate);
}

export function formatHHMM(date: Date): string {
    return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
}

export function isTimeOnlyRaw(raw: string | null): boolean {
    if (!raw) return false;
    return /^([01]?\d|2[0-3]):([0-5]\d)$/.test(raw.trim());
}
