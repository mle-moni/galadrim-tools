import Idea from "#models/idea";
import IdeaComment from "#models/idea_comment";
import IdeaVote from "#models/idea_vote";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { faker } from "@faker-js/faker";

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

    // Refused ideas (frontend heuristic: >5 votes and downvote ratio > 0.7)
    {
        id: 10,
        userId: 1,
        state: "TODO",
        isAnonymous: false,
        text: "[SEED] Refusée: ajouter un captcha sur chaque clic",
    },
    {
        id: 11,
        userId: 2,
        state: "TODO",
        isAnonymous: false,
        text: "[SEED] Refusée: supprimer le bouton logout (pour toujours)",
    },
];

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

    // Lots of downvotes => should appear as "Refusée" in UI
    { id: 10, ideaId: 10, userId: 5, isUpvote: false },
    { id: 11, ideaId: 10, userId: 6, isUpvote: false },
    { id: 12, ideaId: 10, userId: 7, isUpvote: false },
    { id: 13, ideaId: 10, userId: 8, isUpvote: false },
    { id: 14, ideaId: 10, userId: 9, isUpvote: false },
    { id: 15, ideaId: 10, userId: 10, isUpvote: false },
    { id: 16, ideaId: 10, userId: 11, isUpvote: false },
    { id: 17, ideaId: 10, userId: 12, isUpvote: false },
    { id: 18, ideaId: 10, userId: 13, isUpvote: false },
    { id: 19, ideaId: 10, userId: 14, isUpvote: false },

    { id: 20, ideaId: 11, userId: 15, isUpvote: false },
    { id: 21, ideaId: 11, userId: 16, isUpvote: false },
    { id: 22, ideaId: 11, userId: 17, isUpvote: false },
    { id: 23, ideaId: 11, userId: 18, isUpvote: false },
    { id: 24, ideaId: 11, userId: 19, isUpvote: false },
    { id: 25, ideaId: 11, userId: 20, isUpvote: false },
    { id: 26, ideaId: 11, userId: 21, isUpvote: false },
    { id: 27, ideaId: 11, userId: 22, isUpvote: false },
    { id: 28, ideaId: 11, userId: 23, isUpvote: false },
    { id: 29, ideaId: 11, userId: 24, isUpvote: false },
    { id: 30, ideaId: 11, userId: 25, isUpvote: true },
    { id: 31, ideaId: 11, userId: 26, isUpvote: true },
];

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

    { id: 10, ideaId: 10, userId: 1, message: "(seed) Je pense qu'on peut passer." },
    { id: 11, ideaId: 11, userId: 2, message: "(seed) Très mauvaise idée, désolé." },
];

export default class UserSeeder extends BaseSeeder {
    public static environment = ["development"];

    public async run() {
        await Idea.updateOrCreateMany("id", ideas);
        await IdeaVote.updateOrCreateMany("id", ideaVotes);
        await IdeaComment.updateOrCreateMany("id", ideaComments);
    }
}
