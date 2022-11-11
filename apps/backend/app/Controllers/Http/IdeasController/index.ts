import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createOrUpdateVoteRoute } from '../../../Controllers/Http/IdeasController/routes/createOrUpdateVote'
import { destroyIdeaRoute } from '../../../Controllers/Http/IdeasController/routes/destroyIdea'
import { showIdeaRoute } from '../../../Controllers/Http/IdeasController/routes/showIdea'
import { storeIdeaRoute } from '../../../Controllers/Http/IdeasController/routes/storeIdea'
import { updateIdeaRoute } from '../../../Controllers/Http/IdeasController/routes/updateIdea'
import Idea from '../../../Models/Idea'

export default class IdeasController {
    public async index({}: HttpContextContract) {
        const ideas = await Idea.all()
        const data = ideas.map((idea) => idea.frontendData)

        return data
    }

    public async store(params: HttpContextContract) {
        return storeIdeaRoute(params)
    }

    public async show(params: HttpContextContract) {
        return showIdeaRoute(params)
    }

    public async update(params: HttpContextContract) {
        return updateIdeaRoute(params)
    }

    public async destroy(params: HttpContextContract) {
        return destroyIdeaRoute(params)
    }

    public async createOrUpdateVote(params: HttpContextContract) {
        return createOrUpdateVoteRoute(params)
    }
}
