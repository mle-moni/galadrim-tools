import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { breakVotesIndex } from 'App/Controllers/Http/breakVotes/breakVotesIndex'
import { storeBreakVote } from 'App/Controllers/Http/breakVotes/storeBreakVote'

export default class BreakVotesController {
    public async index(ctx: HttpContextContract) {
        return breakVotesIndex(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storeBreakVote(ctx)
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
