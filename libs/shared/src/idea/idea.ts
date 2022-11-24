import { IUserData } from '../user'

export interface IIdeaNote {
    ideaId: IIdea['id']
    userId: IUserData['id']
    isUpvote: boolean
}

export interface IIdea {
    id: number
    text: string
    createdBy: IUserData['id']
    reactions: IIdeaNote[]
    createdAt: Date
}
