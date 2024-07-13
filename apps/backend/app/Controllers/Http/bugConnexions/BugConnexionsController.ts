import { HttpContext } from '@adonisjs/core/http'
import { bugConnexionsList } from '#app/Controllers/Http/bugConnexions/bugConnexionsList'
import { destroyBugConnexion } from '#app/Controllers/Http/bugConnexions/destroyBugConnexion'
import { showBugConnexion } from '#app/Controllers/Http/bugConnexions/showBugConnexion'
import { storeBugConnexion } from '#app/Controllers/Http/bugConnexions/storeBugConnexion'
import { updateBugConnexion } from '#app/Controllers/Http/bugConnexions/updateBugConnexion'

export default class BugConnexionsController {
    public async index(ctx: HttpContext) {
        return bugConnexionsList(ctx)
    }

    public async store(ctx: HttpContext) {
        return storeBugConnexion(ctx)
    }

    public async show(ctx: HttpContext) {
        return showBugConnexion(ctx)
    }

    public async update(ctx: HttpContext) {
        return updateBugConnexion(ctx)
    }

    public async destroy(ctx: HttpContext) {
        return destroyBugConnexion(ctx)
    }
}
