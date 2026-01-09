function hasId(payload: unknown): payload is { id: unknown } {
    return payload !== null && typeof payload === "object" && "id" in payload;
}

export function parseId(payload: unknown): number | null {
    if (typeof payload === "number") {
        return Number.isFinite(payload) ? payload : null;
    }

    if (typeof payload === "string") {
        const trimmed = payload.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }

    if (hasId(payload)) {
        return parseId(payload.id);
    }

    return null;
}

export function parseOptionalNumber(value: unknown): number | undefined {
    if (value == null) return undefined;
    const parsed = parseId(value);
    return parsed == null ? undefined : parsed;
}

export function parseOptionalInt(value: unknown): number | undefined {
    if (value == null) return undefined;

    const text = String(value);
    if (!/^\d+$/.test(text)) return undefined;

    const parsed = Number(text);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
}
