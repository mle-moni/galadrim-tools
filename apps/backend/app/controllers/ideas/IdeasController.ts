import Idea from "#models/idea";
import type { HttpContext } from "@adonisjs/core/http";
import { createCommentRoute } from "./createComment.js";
import { createOrUpdateVoteRoute } from "./createOrUpdateVote.js";
import { destroyIdeaRoute } from "./destroyIdea.js";
import { showIdeaRoute } from "./showIdea.js";
import { storeIdeaRoute } from "./storeIdea.js";
import { updateIdeaRoute } from "./updateIdea.js";

export default class IdeasController {
    public async index({ auth }: HttpContext) {
        const user = auth.user!;

        const ideas = await Idea.all();
        const data = ideas.map((idea) => idea.getUserFrontendData(user.id));

        return data;
    }

    public async store(params: HttpContext) {
        return storeIdeaRoute(params);
    }

    public async show(params: HttpContext) {
        return showIdeaRoute(params);
    }

    public async update(params: HttpContext) {
        return updateIdeaRoute(params);
    }

    public async destroy(params: HttpContext) {
        return destroyIdeaRoute(params);
    }

    public async createOrUpdateVote(params: HttpContext) {
        return createOrUpdateVoteRoute(params);
    }

    public async createComment(params: HttpContext) {
        return createCommentRoute(params);
    }
}
