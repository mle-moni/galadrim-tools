import type { HttpContext } from "@adonisjs/core/http";
import { handleMovement } from "./handle_movement.js";
import { handleReport } from "./handle_report.js";

export default class SensorsController {
    public async index(ctx: HttpContext) {
        return handleMovement(ctx);
    }

    public async report(ctx: HttpContext) {
        return handleReport(ctx);
    }
}
