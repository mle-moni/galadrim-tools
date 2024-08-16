import ForbiddenException from "#exceptions/forbidden_exception";
import PortraitGuessable from "#models/portait_guessable";
import PortraitGuess from "#models/portrait_guess";
import User from "#models/user";
import env from "#start/env";
import type { HttpContext } from "@adonisjs/core/http";
import { schema } from "@adonisjs/validator";
import { Rating } from "ts-fsrs";
import { mapGroupBy } from "./map_group_by.js";

const GradeValidationSchema = schema.create({
    guessId: schema.number(),
    grade: schema.enum([Rating.Again, Rating.Good, Rating.Hard, Rating.Easy] as const),
});

export default class PortraitGuessGameController {
    async index({ auth }: HttpContext) {
        const userId = auth.user!.id;

        const portraitsToGuess = await PortraitGuess.query()
            .preload("portraitGuessable")
            .where("user_id", userId)
            .andWhere("due", "<=", new Date())
            .orderByRaw("due ASC, RAND()");

        return portraitsToGuess.map((p) => p.serialize());
    }

    async store({ auth, request }: HttpContext) {
        const { grade, guessId } = await request.validate({
            schema: GradeValidationSchema,
        });

        const userId = auth.user!.id;
        const portraitGuess = await PortraitGuess.findOrFail(guessId);
        if (userId !== portraitGuess.userId) {
            throw new ForbiddenException();
        }
        portraitGuess.addGuess(grade);
        await portraitGuess.save();

        return { message: "ok" };
    }

    async refresh() {
        const existingGuessablePortraits = await PortraitGuessable.all();

        const refreshPortraitCardsFetch = await fetch(env.get("PORTRAIT_CARD_FETCH_URL"));
        const refreshPortraitCards = (await refreshPortraitCardsFetch.json()) as {
            UserId: number;
            PicturePath: string;
            Firstname: string;
            Lastname: string;
        }[];

        const portraitById = mapGroupBy(existingGuessablePortraits, (p) => p.id);

        const upToDatePortraitGuessablesPromises = refreshPortraitCards.map(async (p) => {
            const existingPortrait = portraitById.get(p.UserId)?.at(0);
            const portrait = existingPortrait ?? new PortraitGuessable();
            portrait.id = p.UserId;
            portrait.pictureUrl = p.PicturePath;
            portrait.guess = `${p.Firstname} ${p.Lastname}`;
            await portrait.save();
            return portrait;
        });

        const upToDatePortraitGuessables = await Promise.all(upToDatePortraitGuessablesPromises);

        const users = await User.query().preload("portraitGuesses");
        const newGuessesToCreate = users
            .flatMap((user) => {
                const userGuessByGuessableId = mapGroupBy(
                    user.portraitGuesses,
                    (p) => p.portraitGuessableId,
                );
                return upToDatePortraitGuessables.flatMap((portraitGuessable) => {
                    const existingGuess = userGuessByGuessableId.get(portraitGuessable.id)?.at(0);
                    if (!existingGuess) {
                        const newGuess = PortraitGuess.createGuess(user.id, portraitGuessable.id);
                        return newGuess;
                    }
                });
            })
            .filter((e): e is PortraitGuess => e !== undefined);

        await PortraitGuess.createMany(newGuessesToCreate);

        return { message: "database updated" };
    }
}
