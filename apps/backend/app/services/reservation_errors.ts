export type ReservationErrorCode =
    | "INVALID_DATE"
    | "INVALID_DATE_RANGE"
    | "INVALID_ROOM"
    | "NOT_BOOKABLE"
    | "PHONEBOX_NOT_BOOKABLE"
    | "RESERVATION_OVERLAP"
    | "FORBIDDEN";

export class ReservationServiceError extends Error {
    constructor(
        public readonly code: ReservationErrorCode,
        message: string,
        public readonly status = 400,
    ) {
        super(message);
        this.name = "ReservationServiceError";
    }
}

export const isReservationServiceError = (error: unknown): error is ReservationServiceError =>
    error instanceof ReservationServiceError;
