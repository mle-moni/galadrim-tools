type ReservationLike = {
    officeRoomId: number;
    start: string | Date;
    end: string | Date;
};

function toDate(value: string | Date): Date | null {
    const date = value instanceof Date ? value : new Date(value);
    if (date.toString() === "Invalid Date") return null;
    return date;
}

export function isReservationActiveAt(reservation: ReservationLike, at: Date): boolean {
    const start = toDate(reservation.start);
    const end = toDate(reservation.end);
    if (!start || !end) return false;

    const atMs = at.getTime();
    return start.getTime() <= atMs && atMs < end.getTime();
}

export function getBusyRoomIdsAt(reservations: ReservationLike[], at: Date): Set<number> {
    const busy = new Set<number>();
    for (const reservation of reservations) {
        if (isReservationActiveAt(reservation, at)) {
            busy.add(reservation.officeRoomId);
        }
    }
    return busy;
}
