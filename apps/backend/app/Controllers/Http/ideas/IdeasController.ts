import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createOrUpdateVoteRoute } from '#app/Controllers/Http/ideas/createOrUpdateVote'
import { createCommentRoute } from '#app/Controllers/Http/ideas/createComment'
import { destroyIdeaRoute } from '#app/Controllers/Http/ideas/destroyIdea'
import { showIdeaRoute } from '#app/Controllers/Http/ideas/showIdea'
import { storeIdeaRoute } from '#app/Controllers/Http/ideas/storeIdea'
import { updateIdeaRoute } from '#app/Controllers/Http/ideas/updateIdea'
import Idea from '#app/Models/Idea'

export default class IdeasController {
    public async index({ auth }: HttpContextContract) {
        const user = auth.user!

        const ideas = await Idea.all()
        const data = ideas.map((idea) => idea.getUserFrontendData(user.id))

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
