import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyPollVote } from 'App/Controllers/Http/pollVotes/destroyPollVote'
import { pollVotesList } from 'App/Controllers/Http/pollVotes/pollVotesList'
import { showPollVote } from 'App/Controllers/Http/pollVotes/showPollVote'
import { storePollVote } from 'App/Controllers/Http/pollVotes/storePollVote'
import { updatePollVote } from 'App/Controllers/Http/pollVotes/updatePollVote'

export default class OrganizationsController {
    public async index(ctx: HttpContextContract) {
        return pollVotesList(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storePollVote(ctx)
    }

    public async show(ctx: HttpContextContract) {
        return showPollVote(ctx)
    }

    public async update(ctx: HttpContextContract) {
        return updatePollVote(ctx)
    }

    public async destroy(ctx: HttpContextContract) {
        return destroyPollVote(ctx)
    }
}
