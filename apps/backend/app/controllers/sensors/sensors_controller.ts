import type { HttpContext } from "@adonisjs/core/http";
import { handleMovement } from "./handle_movement.js";

export default class SensorsController {
    public async index(ctx: HttpContext) {
        return handleMovement(ctx);
    }
}
