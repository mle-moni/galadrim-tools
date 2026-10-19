import type { HttpContext } from "@adonisjs/core/http";
import { ReservationServiceError } from "./reservation_errors.js";

export class ForestRoomsError extends Error {
    constructor(
        public readonly code: string,
        public readonly status: number,
    ) {
        super(code);
    }
}
export function isForestRoomsRequest(ctx: HttpContext) {
    let path = ctx.request.url();
    try {
        path = decodeURIComponent(path);
    } catch {
        /* An invalid encoded URL cannot match a valid route. */
    }
    return path.toLowerCase().startsWith("/integrations/forest/rooms/");
}
export function forestRoomsFailure(error: unknown) {
    if (error instanceof ForestRoomsError || error instanceof ReservationServiceError)
        return {
            status: error.code === "RESERVATION_OVERLAP" ? 409 : error.status,
            code: error.code,
        };
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code === "E_UNAUTHORIZED_ACCESS") return { status: 401, code: "UNAUTHORIZED" };
    if (code === "E_ROW_NOT_FOUND") return { status: 404, code: "NOT_FOUND" };
    if (code === "E_VALIDATION_ERROR" || code === "E_INVALID_JSON_BODY")
        return { status: 400, code: "INVALID_INPUT" };
    return { status: 503, code: "PROVIDER_FAILURE" };
}
