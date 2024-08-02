import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { IIdeaComment } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";

export default class IdeaComment extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare message: string;

    @column()
    declare userId: number;

    @column()
    declare ideaId: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    get frontendData(): IIdeaComment {
        return {
            id: this.id,
            ideaId: this.ideaId,
            message: this.message,
            userId: this.userId,
            createdAt: this.createdAt.toJSDate(),
        };
    }
}
