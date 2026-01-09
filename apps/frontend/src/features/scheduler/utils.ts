import type { LayoutEvent, Reservation } from "./types";
import { format } from "date-fns";

import { START_HOUR } from "./constants";

const RED_RESERVATION_QUERIES = ["entretien final", "occupé 🤖"];

export function includesEntretienFinal(value: string | null | undefined) {
    const haystack = (value ?? "").toLocaleLowerCase();
    return RED_RESERVATION_QUERIES.some((query) => haystack.includes(query));
}

export function isIdMultipleOf(id: number, modulo: number) {
    return id > 0 && id % modulo === 0;
}

export function getPixelsFromTime(date: Date, pixelsPerHour: number) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const totalMinutes = (hours - START_HOUR) * 60 + minutes;
    return (totalMinutes / 60) * pixelsPerHour;
}

export function getTimeFromPixels(pixels: number, baseDate: Date, pixelsPerHour: number) {
    const totalHours = pixels / pixelsPerHour;
    const hoursToAdd = Math.floor(totalHours);
    const minutesToAdd = Math.floor((totalHours - hoursToAdd) * 60);

    const newDate = new Date(baseDate);
    newDate.setHours(START_HOUR + hoursToAdd, minutesToAdd, 0, 0);
    return newDate;
}

export function roundToNearestMinutes(date: Date, interval = 15) {
    const ms = 1000 * 60 * interval;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

export function formatTime(date: Date) {
    return format(date, "HH:mm");
}

function sortReservationsForLayout(a: Reservation, b: Reservation) {
    const startDiff = a.startTime.getTime() - b.startTime.getTime();
    if (startDiff !== 0) return startDiff;

    const durationA = a.endTime.getTime() - a.startTime.getTime();
    const durationB = b.endTime.getTime() - b.startTime.getTime();
    const durationDiff = durationB - durationA;
    if (durationDiff !== 0) return durationDiff;

    return a.id - b.id;
}

function applyColumnLayout(cluster: LayoutEvent[]) {
    if (cluster.length <= 1) return;

    const columnEndTimesMs: number[] = [];
    const columnByEvent = new Map<LayoutEvent, number>();

    for (const event of cluster) {
        const startMs = event.startTime.getTime();

        let columnIndex = -1;
        for (let i = 0; i < columnEndTimesMs.length; i++) {
            const columnEndMs = columnEndTimesMs[i];
            if (columnEndMs !== undefined && startMs >= columnEndMs) {
                columnIndex = i;
                break;
            }
        }

        if (columnIndex === -1) {
            columnIndex = columnEndTimesMs.length;
            columnEndTimesMs.push(event.endTime.getTime());
        } else {
            const previousEndMs = columnEndTimesMs[columnIndex];
            columnEndTimesMs[columnIndex] =
                previousEndMs === undefined
                    ? event.endTime.getTime()
                    : Math.max(previousEndMs, event.endTime.getTime());
        }

        columnByEvent.set(event, columnIndex);
    }

    const columnCount = columnEndTimesMs.length;
    const columnWidth = 100 / columnCount;

    for (const event of cluster) {
        const col = columnByEvent.get(event) ?? 0;
        event.width = columnWidth;
        event.left = col * columnWidth;
    }
}

export function calculateEventLayout(events: Reservation[], pixelsPerHour: number): LayoutEvent[] {
    const sortedEvents = [...events].sort(sortReservationsForLayout);

    const eventsWithMetrics: LayoutEvent[] = sortedEvents.map((event) => {
        const top = getPixelsFromTime(event.startTime, pixelsPerHour);
        const bottom = getPixelsFromTime(event.endTime, pixelsPerHour);

        return {
            ...event,
            top,
            height: bottom - top,
            left: 0,
            width: 100,
        };
    });

    let currentCluster: LayoutEvent[] = [];
    let clusterEndMs = -1;

    for (const event of eventsWithMetrics) {
        if (currentCluster.length === 0) {
            currentCluster = [event];
            clusterEndMs = event.endTime.getTime();
            continue;
        }

        const startMs = event.startTime.getTime();

        if (startMs < clusterEndMs) {
            currentCluster.push(event);
            clusterEndMs = Math.max(clusterEndMs, event.endTime.getTime());
            continue;
        }

        applyColumnLayout(currentCluster);
        currentCluster = [event];
        clusterEndMs = event.endTime.getTime();
    }

    applyColumnLayout(currentCluster);

    return eventsWithMetrics;
}
