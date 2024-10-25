import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { IIdeaNote } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import { BOOLEAN_COLUMN } from "../helpers/columns.js";

export default class IdeaVote extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column(BOOLEAN_COLUMN)
    declare isUpvote: boolean;

    @column()
    declare userId: number;

    @column()
    declare ideaId: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    get frontendData(): IIdeaNote {
        return {
            ideaId: this.ideaId,
            isUpvote: Boolean(this.isUpvote),
            userId: this.userId,
        };
    }
}
