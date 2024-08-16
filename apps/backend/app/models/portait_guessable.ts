import { BaseModel, column, hasMany } from "@adonisjs/lucid/orm";
import PortraitGuess from "./portrait_guess.js";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";

export default class PortraitGuessable extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare pictureUrl: string;

    @column()
    declare guess: string;

    @hasMany(() => PortraitGuess)
    declare portraitGuesses: HasMany<typeof PortraitGuess>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
