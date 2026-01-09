import { describe, expect, it } from "vitest";

import { createKeySequenceMatcher, KONAMI_SEQUENCE } from "./konami";

describe("createKeySequenceMatcher", () => {
    it("matches the Konami code sequence", () => {
        const matcher = createKeySequenceMatcher(KONAMI_SEQUENCE);

        for (const key of KONAMI_SEQUENCE.slice(0, -1)) {
            expect(matcher.feed(key)).toBe(false);
        }

        expect(matcher.feed(KONAMI_SEQUENCE[KONAMI_SEQUENCE.length - 1]!)).toBe(true);
    });

    it("resets on wrong key", () => {
        const matcher = createKeySequenceMatcher(KONAMI_SEQUENCE);
        expect(matcher.feed("ArrowUp")).toBe(false);
        expect(matcher.feed("ArrowLeft")).toBe(false);

        for (const key of KONAMI_SEQUENCE.slice(0, -1)) {
            expect(matcher.feed(key)).toBe(false);
        }
        expect(matcher.feed(KONAMI_SEQUENCE[KONAMI_SEQUENCE.length - 1]!)).toBe(true);
    });

    it("supports overlaps", () => {
        const matcher = createKeySequenceMatcher(KONAMI_SEQUENCE);

        // Start matching, then feed an extra ArrowUp.
        expect(matcher.feed("ArrowUp")).toBe(false);
        expect(matcher.feed("ArrowUp")).toBe(false);
        expect(matcher.feed("ArrowUp")).toBe(false);

        // From here, the remaining sequence should still match.
        for (const key of KONAMI_SEQUENCE.slice(1, -1)) {
            expect(matcher.feed(key)).toBe(false);
        }
        expect(matcher.feed("a")).toBe(true);
    });
});
