import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyRoute } from '#app/Controllers/Http/tags/destroyTag'
import { showRoute } from '#app/Controllers/Http/tags/showTag'
import { storeRoute } from '#app/Controllers/Http/tags/storeTag'
import { indexRoute } from '#app/Controllers/Http/tags/tagsIndex'
import { updateRoute } from '#app/Controllers/Http/tags/updateTag'

export default class TagsController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async store(params: HttpContextContract) {
        return storeRoute(params)
    }

    public async show(params: HttpContextContract) {
        return showRoute(params)
    }

    public async update(params: HttpContextContract) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContextContract) {
        return destroyRoute(params)
    }
}
