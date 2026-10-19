import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import {
    ForestRoomsError,
    forestRoomsFailure,
    isForestRoomsRequest,
} from "#services/forest_rooms_errors";
import env from "#start/env";

export default class ForestRoomsBoundaryMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        const { request, response, logger } = ctx;
        if (!isForestRoomsRequest(ctx)) return next();
        response.header("Cache-Control", "no-store");
        try {
            if (!env.get("FOREST_ROOMS_INTEGRATION_ENABLED", false))
                throw new ForestRoomsError("NOT_FOUND", 404);
            if (request.header("origin") || request.header("cookie"))
                throw new ForestRoomsError("SERVER_CREDENTIAL_REQUIRED", 401);
            if (request.method() !== "POST") throw new ForestRoomsError("METHOD_NOT_ALLOWED", 405);
            const length = request.header("content-length");
            if (!length || !/^\d+$/.test(length) || request.header("transfer-encoding"))
                throw new ForestRoomsError("CONTENT_LENGTH_REQUIRED", 411);
            if (Number(length) > 8192) throw new ForestRoomsError("PAYLOAD_TOO_LARGE", 413);
            if (
                request.header("content-encoding") ||
                request.header("content-type")?.split(";")[0] !== "application/json"
            )
                throw new ForestRoomsError("JSON_REQUIRED", 415);
            return await next();
        } catch (error) {
            const failure = forestRoomsFailure(error);
            if (failure.code === "PROVIDER_FAILURE")
                logger.error({ code: "FOREST_ROOMS_FAILURE" }, "Forest rooms integration failed");
            return response.status(failure.status).send({ contractVersion: 1, code: failure.code });
        }
    }
}
