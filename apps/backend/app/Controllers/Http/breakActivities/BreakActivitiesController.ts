import type { HttpContext } from '@adonisjs/core/http'
import { breakActivitiesIndex } from '#app/Controllers/Http/breakActivities/breakActivitiesIndex'

export default class BreakActivitiesController {
    public async index(ctx: HttpContext) {
        return breakActivitiesIndex(ctx)
    }

    public async store(ctx: HttpContext) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async show(ctx: HttpContext) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async update(ctx: HttpContext) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }

    public async destroy(ctx: HttpContext) {
        return ctx.response.notImplemented({ error: 'not implemented' })
    }
}
