import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { breakActivitiesIndex } from 'App/Controllers/Http/breakActivities/breakActivitiesIndex'

export default class BreakActivitiesController {
    public async index(ctx: HttpContextContract) {
        return breakActivitiesIndex(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async show(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async update(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async destroy(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }
}
