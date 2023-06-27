import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CardsController {
    public async index(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
    }

    public async store(ctx: HttpContextContract) {
        return ctx.response.notImplemented({ message: 'not implemented' })
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
