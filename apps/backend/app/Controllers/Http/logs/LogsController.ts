import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { showCaddyLogs } from './showCaddyLogs'
import { storeCaddyLogs } from './storeCaddyLogs'

export default class CaddyLogsController {
    public async showCaddyLogs(ctx: HttpContextContract) {
        return showCaddyLogs(ctx)
    }

    public async storeCaddyLogs(ctx: HttpContextContract) {
        return storeCaddyLogs(ctx)
    }

    public async showAtopLogs(ctx: HttpContextContract) {
        return showCaddyLogs(ctx)
    }

    public async storeAtopLogs(ctx: HttpContextContract) {
        return storeCaddyLogs(ctx)
    }
}
