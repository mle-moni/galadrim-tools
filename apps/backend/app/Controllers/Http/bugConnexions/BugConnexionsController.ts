import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bugConnexionsList } from 'App/Controllers/Http/bugConnexions/bugConnexionsList'
import { destroyBugConnexion } from 'App/Controllers/Http/bugConnexions/destroyBugConnexion'
import { showBugConnexion } from 'App/Controllers/Http/bugConnexions/showBugConnexion'
import { storeBugConnexion } from 'App/Controllers/Http/bugConnexions/storeBugConnexion'
import { updateBugConnexion } from 'App/Controllers/Http/bugConnexions/updateBugConnexion'

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
