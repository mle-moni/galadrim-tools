import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { cardsIndex } from 'App/Controllers/Http/cards/cardsIndex'
import { storeCard } from 'App/Controllers/Http/cards/storeCard'
import { updateCard } from 'App/Controllers/Http/cards/updateCard'

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
        return updateCard(ctx)
    }

    public async destroy(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
    }
}
