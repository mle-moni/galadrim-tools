import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateTagsParams } from 'App/Controllers/Http/tags/storeTag'
import Tag from 'App/Models/Tag'
import Ws from 'App/Services/Ws'

export const updateRoute = async ({ params, request }: HttpContextContract) => {
    const tag = await Tag.findOrFail(params.id)
    const { name } = await validateTagsParams(request)
    tag.name = name
    await tag.save()
    Ws.io.to('connectedSockets').emit('updateTag', tag)
    return tag
}
