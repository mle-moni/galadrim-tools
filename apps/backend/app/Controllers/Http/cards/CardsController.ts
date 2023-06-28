import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { cardsIndex } from 'App/Controllers/Http/cards/cardsIndex'
import { storeCard } from 'App/Controllers/Http/cards/storeCard'

export default class CardsController {
    public async index(ctx: HttpContextContract) {
        return cardsIndex(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storeCard(ctx)
    }

    public async show(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
    }

    public async update(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
    }

    public async destroy(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
    }
}
