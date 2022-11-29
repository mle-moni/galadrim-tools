import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Idea from '../../app/Models/Idea'
import IdeaVote from '../../app/Models/IdeaVote'
import IdeaComment from '../../app/Models/IdeaComment'
import { faker } from '@faker-js/faker'

const ideas = [
    { id: 1, userId: 1, text: faker.commerce.productDescription() },
    { id: 2, userId: 2, text: faker.commerce.productDescription() },
    { id: 3, userId: 2, text: faker.commerce.productDescription() },
    { id: 4, userId: 3, text: faker.commerce.productDescription() },
    { id: 5, userId: 4, text: faker.commerce.productDescription() },
    { id: 6, userId: 1, text: faker.commerce.productDescription() },
    { id: 7, userId: 3, text: faker.commerce.productDescription() },
    { id: 8, userId: 1, text: faker.commerce.productDescription() },
    { id: 9, userId: 4, text: faker.commerce.productDescription() },
]

const ideaVotes = [
    { id: 1, ideaId: 1, userId: 2, isUpvote: true },
    { id: 2, ideaId: 1, userId: 3, isUpvote: false },
    { id: 3, ideaId: 1, userId: 4, isUpvote: true },
    { id: 4, ideaId: 2, userId: 3, isUpvote: true },
    { id: 5, ideaId: 5, userId: 4, isUpvote: true },
    { id: 6, ideaId: 1, userId: 1, isUpvote: true },
    { id: 7, ideaId: 6, userId: 3, isUpvote: true },
    { id: 8, ideaId: 4, userId: 1, isUpvote: false },
    { id: 9, ideaId: 8, userId: 4, isUpvote: true },
]

const ideaComments = [
    { id: 1, ideaId: 1, userId: 1, message: faker.hacker.phrase() },
    { id: 2, ideaId: 1, userId: 2, message: faker.hacker.phrase() },
    { id: 3, ideaId: 1, userId: 1, message: faker.hacker.phrase() },
    { id: 4, ideaId: 2, userId: 2, message: faker.hacker.phrase() },
    { id: 5, ideaId: 2, userId: 2, message: faker.hacker.phrase() },
    { id: 6, ideaId: 3, userId: 4, message: faker.hacker.phrase() },
    { id: 7, ideaId: 8, userId: 3, message: faker.hacker.phrase() },
    { id: 8, ideaId: 5, userId: 2, message: faker.hacker.phrase() },
    { id: 9, ideaId: 6, userId: 1, message: faker.hacker.phrase() },
]

export default class UserSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        await Idea.updateOrCreateMany('id', ideas)
        await IdeaVote.updateOrCreateMany('id', ideaVotes)
        await IdeaComment.updateOrCreateMany('id', ideaComments)
    }
}
