import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { IIdeaNote } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";

export default class IdeaVote extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column({
        prepare: (value: 0 | 1) => Boolean(value),
        serialize: (value: 0 | 1) => Boolean(value),
    })
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
