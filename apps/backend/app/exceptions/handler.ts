import { ExceptionHandler, type HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";

import { forestRoomsFailure, isForestRoomsRequest } from "#services/forest_rooms_errors";

export default class HttpExceptionHandler extends ExceptionHandler {
    /**
     * In debug mode, the exception handler will display verbose errors
     * with pretty printed stack traces.
     */
    protected debug = !app.inProduction;

    /**
     * The method is used for handling errors and returning
     * response to the client
     */
    async handle(error: unknown, ctx: HttpContext) {
        if (isForestRoomsRequest(ctx)) {
            const failure = forestRoomsFailure(error);
            ctx.response.header("Cache-Control", "no-store");
            return ctx.response
                .status(failure.status)
                .send({ contractVersion: 1, code: failure.code });
        }
        return super.handle(error, ctx);
    }

    /**
     * The method is used to report error to the logging service or
     * the third party error monitoring service.
     *
     * @note You should not attempt to send a response from this method.
     */
    async report(error: unknown, ctx: HttpContext) {
        if (isForestRoomsRequest(ctx)) {
            if (forestRoomsFailure(error).code === "PROVIDER_FAILURE")
                ctx.logger.error(
                    { code: "FOREST_ROOMS_FAILURE" },
                    "Forest rooms integration failed",
                );
            return;
        }
        return super.report(error, ctx);
    }
}
