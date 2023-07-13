import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { breakTimesIndex } from 'App/Controllers/Http/breakTimes/breakTimesIndex'

export default class BreakTimesController {
    public async index(ctx: HttpContextContract) {
        return breakTimesIndex(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async show(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async updat(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async destro(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }
}
