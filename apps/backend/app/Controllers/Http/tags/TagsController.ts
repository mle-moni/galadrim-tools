import { HttpContext } from '@adonisjs/core/http'
import { destroyRoute } from '#app/Controllers/Http/tags/destroyTag'
import { showRoute } from '#app/Controllers/Http/tags/showTag'
import { storeRoute } from '#app/Controllers/Http/tags/storeTag'
import { indexRoute } from '#app/Controllers/Http/tags/tagsIndex'
import { updateRoute } from '#app/Controllers/Http/tags/updateTag'

export default class TagsController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async store(params: HttpContext) {
        return storeRoute(params)
    }

    public async show(params: HttpContext) {
        return showRoute(params)
    }

    public async update(params: HttpContext) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params)
    }
}
