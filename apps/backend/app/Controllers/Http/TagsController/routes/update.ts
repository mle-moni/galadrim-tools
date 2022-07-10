import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from '../../../../Models/Tag'
import Ws from '../../../../Services/Ws'
import { validateTagsParams } from './store'

export const updateRoute = async ({ params, request }: HttpContextContract) => {
    const tag = await Tag.findOrFail(params.id)
    const { name } = await validateTagsParams(request)
    tag.name = name
    await tag.save()
    Ws.io.to('connectedSockets').emit('updateTag', tag)
    return tag
}
