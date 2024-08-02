import type { HttpContext } from "@adonisjs/core/http";
import { showAtopLogs } from "./showAtopLogs.js";
import { showCaddyLogs } from "./showCaddyLogs.js";
import { storeAtopLogs } from "./storeAtopLogs.js";
import { storeCaddyLogs } from "./storeCaddyLogs.js";

export default class CaddyLogsController {
    public async showCaddyLogs(ctx: HttpContext) {
        return showCaddyLogs(ctx);
    }

    public async storeCaddyLogs(ctx: HttpContext) {
        return storeCaddyLogs(ctx);
    }

    public async showAtopLogs(ctx: HttpContext) {
        return showAtopLogs(ctx);
    }

    public async storeAtopLogs(ctx: HttpContext) {
        return storeAtopLogs(ctx);
    }
}
