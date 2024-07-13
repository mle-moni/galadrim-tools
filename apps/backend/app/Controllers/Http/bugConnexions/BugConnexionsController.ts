import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bugConnexionsList } from '#app/Controllers/Http/bugConnexions/bugConnexionsList'
import { destroyBugConnexion } from '#app/Controllers/Http/bugConnexions/destroyBugConnexion'
import { showBugConnexion } from '#app/Controllers/Http/bugConnexions/showBugConnexion'
import { storeBugConnexion } from '#app/Controllers/Http/bugConnexions/storeBugConnexion'
import { updateBugConnexion } from '#app/Controllers/Http/bugConnexions/updateBugConnexion'

export default class BugConnexionsController {
    public async index(ctx: HttpContextContract) {
        return bugConnexionsList(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storeBugConnexion(ctx)
    }

    public async show(ctx: HttpContextContract) {
        return showBugConnexion(ctx)
    }

    public async update(ctx: HttpContextContract) {
        return updateBugConnexion(ctx)
    }

    public async destroy(ctx: HttpContextContract) {
        return destroyBugConnexion(ctx)
    }
}
