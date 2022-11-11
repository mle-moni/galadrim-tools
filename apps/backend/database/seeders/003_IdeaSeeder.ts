import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Idea from '../../app/Models/Idea'
import IdeaVote from '../../app/Models/IdeaVote'

const ideas = [
    { id: 1, userId: 1, text: 'Première idée' },
    { id: 2, userId: 2, text: 'Idée du siècle' },
    { id: 3, userId: 2, text: 'Idée saugrenue' },
    { id: 4, userId: 3, text: 'Idée bizarre' },
    { id: 5, userId: 4, text: 'Idée fourbe' },
    { id: 6, userId: 1, text: 'Idée fragile' },
    { id: 7, userId: 3, text: 'Idée de ouf' },
    { id: 8, userId: 1, text: 'Superbe idée' },
    { id: 9, userId: 4, text: 'Idée cringe' },
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

export default class UserSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        await Idea.updateOrCreateMany('id', ideas)

        await IdeaVote.updateOrCreateMany('id', ideaVotes)
    }
}
