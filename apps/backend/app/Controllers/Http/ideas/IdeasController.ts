import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createOrUpdateVoteRoute } from 'App/Controllers/Http/ideas/createOrUpdateVote'
import { createCommentRoute } from 'App/Controllers/Http/ideas/createComment'
import { destroyIdeaRoute } from 'App/Controllers/Http/ideas/destroyIdea'
import { showIdeaRoute } from 'App/Controllers/Http/ideas/showIdea'
import { storeIdeaRoute } from 'App/Controllers/Http/ideas/storeIdea'
import { updateIdeaRoute } from 'App/Controllers/Http/ideas/updateIdea'
import Idea from 'App/Models/Idea'

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

    public async createComment(params: HttpContextContract) {
        return createCommentRoute(params)
    }
}
