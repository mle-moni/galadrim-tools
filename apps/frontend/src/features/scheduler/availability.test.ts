import { describe, expect, it } from "vitest";

import { getBusyRoomIdsAt, isReservationActiveAt } from "./availability";

describe("availability", () => {
    it("treats reservation as active for [start, end)", () => {
        const reservation = {
            officeRoomId: 1,
            start: "2025-01-01T10:00:00.000Z",
            end: "2025-01-01T11:00:00.000Z",
        };

        expect(isReservationActiveAt(reservation, new Date("2025-01-01T09:59:59.999Z"))).toBe(
            false,
        );
        expect(isReservationActiveAt(reservation, new Date("2025-01-01T10:00:00.000Z"))).toBe(true);
        expect(isReservationActiveAt(reservation, new Date("2025-01-01T10:30:00.000Z"))).toBe(true);
        expect(isReservationActiveAt(reservation, new Date("2025-01-01T11:00:00.000Z"))).toBe(
            false,
        );
    });

    it("returns busy room ids for active reservations", () => {
        const reservations = [
            {
                officeRoomId: 1,
                start: "2025-01-01T10:00:00.000Z",
                end: "2025-01-01T11:00:00.000Z",
            },
            {
                officeRoomId: 2,
                start: "2025-01-01T10:30:00.000Z",
                end: "2025-01-01T12:00:00.000Z",
            },
        ];

        const busy = getBusyRoomIdsAt(reservations, new Date("2025-01-01T10:15:00.000Z"));
        expect(Array.from(busy).sort((a, b) => a - b)).toEqual([1]);

        const busy2 = getBusyRoomIdsAt(reservations, new Date("2025-01-01T10:45:00.000Z"));
        expect(Array.from(busy2).sort((a, b) => a - b)).toEqual([1, 2]);
    });
});
