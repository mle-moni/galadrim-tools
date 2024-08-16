import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";
import { createEmptyCard, FSRS, type Grade, type Card } from "ts-fsrs";
import PortraitGuessable from "./portait_guessable.js";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

type CardWithNoDueDate = Omit<Card, "due" | "last_review">;

const CARD_COLUMN = {
    prepare: (value: Card | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | object | null) => {
        if (value === null) {
            return null;
        }
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return value;
    },
};

export default class PortraitGuess extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare userId: number;

    @column.dateTime()
    declare due: DateTime;

    @column(CARD_COLUMN)
    declare fsrsCard: CardWithNoDueDate;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @column()
    declare portraitGuessableId: number;

    @belongsTo(() => PortraitGuessable)
    declare portraitGuessable: BelongsTo<typeof PortraitGuessable>;

    get card(): Card {
        const card: Card = {
            ...this.fsrsCard,
            due: this.due.toJSDate(),
        };
        return card;
    }

    static createGuess(userId: number, portraitGuessableId: number) {
        const guess = new PortraitGuess();
        guess.userId = userId;
        guess.portraitGuessableId = portraitGuessableId;
        const { due, ...fsrsCard } = createEmptyCard(new Date());
        guess.fsrsCard = fsrsCard;
        guess.due = DateTime.fromJSDate(due);
        return guess;
    }

    addGuess(grade: Grade) {
        const fsrs = new FSRS({ enable_fuzz: true, enable_short_term: true });
        const { card } = fsrs.next(this.card, new Date(), grade);
        this.fsrsCard = card;
        this.due = DateTime.fromJSDate(card.due);
    }
}
