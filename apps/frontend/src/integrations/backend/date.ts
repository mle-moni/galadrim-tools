export function startOfDay(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

export function startOfDayIso(date: Date) {
    return startOfDay(date).toISOString();
}
