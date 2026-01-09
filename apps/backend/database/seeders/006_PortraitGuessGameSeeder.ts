import PortraitGuessable from "#models/portait_guessable";
import PortraitGuess from "#models/portrait_guess";
import User from "#models/user";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { faker } from "@faker-js/faker";

const GUESSABLES_TARGET_COUNT = 25;
const FALLBACK_GUESSABLE_ID_START = 10_000;

export default class PortraitGuessGameSeeder extends BaseSeeder {
    public static environment = ["development"];

    public async run() {
        await PortraitGuess.query().delete();
        await PortraitGuessable.query().delete();

        const users = await User.query().select(["id", "username", "imageUrl"]);
        if (users.length === 0) return;

        const guessables: Array<Pick<PortraitGuessable, "id" | "pictureUrl" | "guess">> = [];
        const usedGuessableIds = new Set<number>();

        const usersForGuessables = users.slice(0, Math.min(users.length, GUESSABLES_TARGET_COUNT));
        for (const user of usersForGuessables) {
            if (usedGuessableIds.has(user.id)) continue;
            usedGuessableIds.add(user.id);

            guessables.push({
                id: user.id,
                pictureUrl: user.imageUrl ?? faker.image.url(),
                guess: user.username,
            });
        }

        let fallbackId = FALLBACK_GUESSABLE_ID_START;
        while (guessables.length < GUESSABLES_TARGET_COUNT) {
            while (usedGuessableIds.has(fallbackId)) {
                fallbackId += 1;
            }

            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();

            guessables.push({
                id: fallbackId,
                pictureUrl: faker.image.url(),
                guess: `${firstName} ${lastName}`,
            });

            usedGuessableIds.add(fallbackId);
            fallbackId += 1;
        }

        await PortraitGuessable.createMany(guessables);

        const guesses: PortraitGuess[] = [];
        for (const user of users) {
            for (const guessable of guessables) {
                guesses.push(PortraitGuess.createGuess(user.id, guessable.id));
            }
        }

        await PortraitGuess.createMany(guesses);
    }
}
