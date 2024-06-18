import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { showAtopLogs } from './showAtopLogs'
import { showCaddyLogs } from './showCaddyLogs'
import { storeAtopLogs } from './storeAtopLogs'
import { storeCaddyLogs } from './storeCaddyLogs'

export default class CaddyLogsController {
    public async showCaddyLogs(ctx: HttpContextContract) {
        return showCaddyLogs(ctx)
    }

    public async storeCaddyLogs(ctx: HttpContextContract) {
        return storeCaddyLogs(ctx)
    }

    public async showAtopLogs(ctx: HttpContextContract) {
        return showAtopLogs(ctx)
    }

    public async storeAtopLogs(ctx: HttpContextContract) {
        return storeAtopLogs(ctx)
    }
}
