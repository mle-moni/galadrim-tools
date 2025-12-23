import { describe, expect, it } from "vitest";

import type { Reservation } from "./types";

import { calculateEventLayout } from "./utils";

function atTime(hours: number, minutes: number) {
    return new Date(2025, 0, 1, hours, minutes, 0, 0);
}

function reservation(id: number, start: Date, end: Date): Reservation {
    return {
        id,
        roomId: 1,
        title: `Reservation ${id}`,
        startTime: start,
        endTime: end,
        color: "bg-muted",
        owner: `User ${id}`,
        canEdit: true,
    };
}

describe("calculateEventLayout", () => {
    it("splits chain-overlapping events with no horizontal gap", () => {
        // A overlaps B and C, but B and C do not overlap each other.
        const events = [
            reservation(1, atTime(10, 0), atTime(11, 0)),
            reservation(2, atTime(10, 0), atTime(10, 30)),
            reservation(3, atTime(10, 30), atTime(11, 0)),
        ];

        const layout = calculateEventLayout(events, 80);
        const byId = new Map(layout.map((e) => [e.id, e] as const));

        expect(byId.get(1)!.width).toBe(50);
        expect(byId.get(2)!.width).toBe(50);
        expect(byId.get(3)!.width).toBe(50);

        expect(byId.get(1)!.left).toBe(0);
        expect(byId.get(2)!.left).toBe(50);
        expect(byId.get(3)!.left).toBe(50);
    });

    it("splits fully-overlapping events equally", () => {
        const events = [
            reservation(1, atTime(10, 0), atTime(11, 0)),
            reservation(2, atTime(10, 15), atTime(11, 0)),
            reservation(3, atTime(10, 30), atTime(11, 0)),
        ];

        const layout = calculateEventLayout(events, 80);

        for (const event of layout) {
            expect(event.width).toBeCloseTo(100 / 3, 6);
        }

        const sortedLefts = layout
            .map((e) => e.left)
            .sort((a, b) => a - b)
            .map((v) => Number(v.toFixed(6)));

        expect(sortedLefts).toEqual([
            Number((0).toFixed(6)),
            Number((100 / 3).toFixed(6)),
            Number(((100 / 3) * 2).toFixed(6)),
        ]);
    });
});
