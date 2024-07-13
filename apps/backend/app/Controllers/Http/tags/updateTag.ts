import { HttpContext } from '@adonisjs/core/http'
import { validateTagsParams } from '#app/Controllers/Http/tags/storeTag'
import Tag from '#app/Models/Tag'
import Ws from '#app/Services/Ws'

export const updateRoute = async ({ params, request }: HttpContext) => {
    const tag = await Tag.findOrFail(params.id)
    const { name } = await validateTagsParams(request)
    tag.name = name
    await tag.save()
    Ws.io.to('connectedSockets').emit('updateTag', tag)
    return tag
}
