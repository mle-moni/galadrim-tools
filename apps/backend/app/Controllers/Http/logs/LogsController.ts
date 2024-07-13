import type { HttpContext } from '@adonisjs/core/http'
import { showAtopLogs } from './showAtopLogs'
import { showCaddyLogs } from './showCaddyLogs'
import { storeAtopLogs } from './storeAtopLogs'
import { storeCaddyLogs } from './storeCaddyLogs'

export default class CaddyLogsController {
    public async showCaddyLogs(ctx: HttpContext) {
        return showCaddyLogs(ctx)
    }

    public async storeCaddyLogs(ctx: HttpContext) {
        return storeCaddyLogs(ctx)
    }

    public async showAtopLogs(ctx: HttpContext) {
        return showAtopLogs(ctx)
    }

    public async storeAtopLogs(ctx: HttpContext) {
        return storeAtopLogs(ctx)
    }
}
