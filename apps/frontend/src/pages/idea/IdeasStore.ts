import { IIdea, IIdeaNote, IUserData } from '@galadrim-tools/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { notifyError, notifySuccess } from '../../utils/notification'
import { APPLICATION_JSON_HEADERS } from './createIdea/CreateIdeaStore'

export const findUserReaction = (idea: IIdea, userId: IUserData['id']) => {
    return idea.reactions.find((r) => r.userId === userId)
}

export class IdeasStore {
    loadingState = new LoadingStateStore()

    constructor() {
        makeAutoObservable(this)
    }

    private _ideas: IIdea[] = []

    setIdeas(ideas: IIdea[]) {
        this.ideas = ideas
    }

    set ideas(ideas: IIdea[]) {
        this._ideas = ideas
    }

    get ideas() {
        return this._ideas
    }

    isIdeaBad(reactions: IIdeaNote[]) {
        const downvotes = reactions.reduce((acc, { isUpvote }) => acc + Number(!isUpvote), 0)
        const ratio = reactions.length > 0 ? downvotes / reactions.length : 0

        return reactions.length > 5 && ratio > 0.7
    }

    get orderedIdeas() {
        const ideasWithMoreInfos = this.ideas.map(({ createdBy, id, reactions, text }) => ({
            createdBy,
            id,
            reactions,
            text,
            isBad: this.isIdeaBad(reactions),
        }))

        const orderedIdeas = ideasWithMoreInfos.sort((a, b) => Number(a.isBad) - Number(b.isBad))

        return orderedIdeas
    }

    async fetchIdeaList() {
        this.loadingState.setIsLoading(true)
        const result = await fetchBackendJson<IIdea[], unknown>('/ideas')
        this.loadingState.setIsLoading(false)
        if (result.ok) {
            this.ideas = result.json
        }
    }

    findIdea(ideaId: IIdea['id']) {
        return this._ideas.find((idea) => idea.id === ideaId)
    }

    setReactions(idea: IIdea, state: IIdeaNote[]) {
        idea.reactions = state
    }

    removeIdeaById(id: number) {
        this.setIdeas(this._ideas.filter((idea) => id !== idea.id))
    }

    async deleteIdea(id: number) {
        const res = await fetchBackendJson(`/ideas/${id}`, 'DELETE')

        if (res.ok) {
            notifySuccess(`L'idée a été supprimée`)
            this.removeIdeaById(id)
        } else {
            notifyError(getErrorMessage(res.json, `impossible de supprimer l'idée numéro ${id}`))
        }
    }

    async deleteReaction(idea: IIdea, userId: IIdeaNote['userId']) {
        const result = await fetchBackendJson<{ message: string }, unknown>(
            '/createOrUpdateIdeaVote',
            'POST',
            {
                body: JSON.stringify({
                    ideaId: idea.id,
                }),
                headers: APPLICATION_JSON_HEADERS,
            }
        )

        if (result.ok) {
            this.setReactions(
                idea,
                idea.reactions.filter((r) => r.userId !== userId)
            )
        } else {
            notifyError(getErrorMessage(result.json, "Votre note n'a pas pu être pris en compte"))
        }
    }

    saveReactionLocally(idea: IIdea, reaction: IIdeaNote) {
        const currentReaction = findUserReaction(idea, reaction.userId)
        if (currentReaction) {
            currentReaction.isUpvote = reaction.isUpvote
        } else {
            idea.reactions.push(reaction)
        }
    }

    async saveReaction(idea: IIdea, reaction: IIdeaNote) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...rest } = reaction
        const result = await fetchBackendJson<{ message: string; ideaVote: IIdeaNote }, unknown>(
            '/createOrUpdateIdeaVote',
            'POST',
            {
                body: JSON.stringify(rest),
                headers: APPLICATION_JSON_HEADERS,
            }
        )
        if (result.ok) {
            this.saveReactionLocally(idea, result.json.ideaVote)
        } else if (!result.ok) {
            notifyError(getErrorMessage(result.json, "Votre note n'a pas pu être pris en compte"))
        }
    }

    setReaction(ideaId: IIdea['id'], userId: IUserData['id'], newReaction: boolean) {
        const matchingIdea = this.findIdea(ideaId)

        if (!matchingIdea) {
            notifyError('Impossible de sauvegarder la réaction')
            return
        }

        let userReaction = findUserReaction(matchingIdea, userId)

        if (userReaction) {
            if (userReaction.isUpvote === newReaction) {
                // same as previous, delete reaction
                this.deleteReaction(matchingIdea, userId)
                return
            } else {
                userReaction.isUpvote = newReaction
            }
        }
        if (!userReaction) {
            userReaction = {
                userId: userId,
                ideaId: ideaId,
                isUpvote: newReaction,
            }
        }

        this.saveReaction(matchingIdea, userReaction)
    }

    createOrUpdateIdea(idea: IIdea) {
        const foundIdea = this._ideas.find(({ id }) => idea.id === id)
        if (foundIdea === undefined) {
            this._ideas.unshift(idea)
            return
        }
        foundIdea.createdBy = idea.createdBy
        foundIdea.reactions = idea.reactions
        foundIdea.text = idea.text
    }
}
