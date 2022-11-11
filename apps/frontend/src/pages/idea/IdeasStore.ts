import { makeAutoObservable, reaction } from 'mobx'
import { IIdea, IIdeaNote, IUserData } from '@galadrim-tools/shared'
import { LoadingStateStore } from '../../reusableComponents/form/LoadingStateStore'
import { assert } from 'console'
import { notifyError } from '../../utils/notification'

const FAKE_IDEA: IIdea[] = [
    {
        createdBy: 1,
        id: 1,
        text: 'Mollit sunt aliquip eiusmod amet et exercitation sunt culpa. Incididunt consequat voluptate ex veniam officia aute labore eiusmod do consectetur est. Sit deserunt nulla sint dolore incididunt sunt aute sint mollit officia id minim do anim. Cupidatat ea cupidatat eu duis tempor proident ad nostrud proident. Nulla ex Lorem consequat excepteur non voluptate amet ea occaecat voluptate enim occaecat ex.',
        reactions: [
            {
                isUpvote: true,
                ideaId: 1,
                userId: 1,
            },
        ],
    },
    {
        createdBy: 1,
        id: 3,
        text: 'Minim duis dolore ipsum proident occaecat culpa irure anim. Aute est Lorem eu reprehenderit est exercitation eiusmod incididunt. Velit labore proident deserunt irure id. Ad in aute reprehenderit reprehenderit excepteur duis duis aute ut labore. Incididunt Lorem amet pariatur proident ullamco officia ipsum et incididunt Lorem. Proident dolore excepteur elit eiusmod voluptate laborum veniam veniam aliqua laboris voluptate.',
        reactions: [
            {
                isUpvote: true,
                ideaId: 3,
                userId: 1,
            },
        ],
    },
    {
        createdBy: 1,
        id: 2,
        text: 'Nisi amet exercitation eiusmod nisi voluptate sit mollit consectetur incididunt pariatur et mollit ut. Mollit ipsum in ut ad. In aute veniam magna nulla nostrud voluptate.',
        reactions: [
            {
                isUpvote: true,
                ideaId: 2,
                userId: 3,
            },
        ],
    },
    {
        createdBy: 1,
        id: 5,
        text: 'Alors alors alors alors',
        reactions: [
            {
                isUpvote: true,
                ideaId: 5,
                userId: 1,
            },
        ],
    },
    {
        createdBy: 1,
        id: 6,
        text: 'Alors alors alors alors',
        reactions: [
            {
                isUpvote: true,
                ideaId: 6,
                userId: 1,
            },
        ],
    },
    {
        createdBy: 1,
        id: 7,
        text: 'Alors alors alors alors',
        reactions: [
            {
                isUpvote: true,
                ideaId: 7,
                userId: 1,
            },
        ],
    },
]

export const findUserReaction = (idea: IIdea, userId: IUserData['id']) => {
    return idea.reactions.find((r) => r.userId === userId)
}

export class IdeasStore {
    loadingState = new LoadingStateStore()

    constructor() {
        makeAutoObservable(this)
    }

    private _ideas: IIdea[] = FAKE_IDEA

    setIdeas(ideas: IIdea[]) {
        this.ideas = ideas
    }

    set ideas(ideas: IIdea[]) {
        this._ideas = ideas
    }

    get ideas() {
        return this._ideas
    }

    findIdea(ideaId: IIdea['id']) {
        return this._ideas.find((idea) => idea.id === ideaId)
    }

    deleteReaction(idea: IIdea, reaction: IIdeaNote) {
        console.log('on delete la reaction dans le backend')
        idea.reactions = idea.reactions.filter((r) => r.userId !== reaction.userId)
    }

    saveReaction(reaction: IIdeaNote) {
        console.log('on save la reaction danse le backend')
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
                this.deleteReaction(matchingIdea, userReaction)
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
            matchingIdea.reactions.push(userReaction)
        }

        this.saveReaction(userReaction)
    }
}
