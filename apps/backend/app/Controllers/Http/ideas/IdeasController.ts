import type { HttpContext } from '@adonisjs/core/http'
import { createOrUpdateVoteRoute } from '#app/Controllers/Http/ideas/createOrUpdateVote'
import { createCommentRoute } from '#app/Controllers/Http/ideas/createComment'
import { destroyIdeaRoute } from '#app/Controllers/Http/ideas/destroyIdea'
import { showIdeaRoute } from '#app/Controllers/Http/ideas/showIdea'
import { storeIdeaRoute } from '#app/Controllers/Http/ideas/storeIdea'
import { updateIdeaRoute } from '#app/Controllers/Http/ideas/updateIdea'
import Idea from '#app/Models/Idea'

export default class IdeasController {
    public async index({ auth }: HttpContext) {
        const user = auth.user!

        const ideas = await Idea.all()
        const data = ideas.map((idea) => idea.getUserFrontendData(user.id))

        return data
    }

    public async store(params: HttpContext) {
        return storeIdeaRoute(params)
    }

    public async show(params: HttpContext) {
        return showIdeaRoute(params)
    }

    public async update(params: HttpContext) {
        return updateIdeaRoute(params)
    }

    public async destroy(params: HttpContext) {
        return destroyIdeaRoute(params)
    }

    public async createOrUpdateVote(params: HttpContext) {
        return createOrUpdateVoteRoute(params)
    }

    public async createComment(params: HttpContext) {
        return createCommentRoute(params)
    }
}
