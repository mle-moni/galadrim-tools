import { BaseModel, beforeFetch, belongsTo, column, hasMany } from "@adonisjs/lucid/orm";
import type { ModelQueryBuilderContract } from "@adonisjs/lucid/types/model";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import type { IIdea } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import { BOOLEAN_COLUMN } from "../helpers/columns.js";
import IdeaComment from "./idea_comment.js";
import IdeaVote from "./idea_vote.js";
import User from "./user.js";

export default class Idea extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare userId: number;

    @column()
    declare text: string;

    @column(BOOLEAN_COLUMN)
    declare isAnonymous: boolean;

    @column()
    declare state: IIdea["state"];

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>;

    @hasMany(() => IdeaVote)
    declare ideaVotes: HasMany<typeof IdeaVote>;

    @hasMany(() => IdeaComment)
    declare ideaComments: HasMany<typeof IdeaComment>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFetch()
    static autoLoadParameters(query: ModelQueryBuilderContract<typeof Idea>) {
        query.preload("ideaVotes");
        query.preload("ideaComments");
    }

    isOwner(userId: number) {
        return this.userId === userId;
    }

    get frontendData(): IIdea {
        return {
            id: this.id,
            createdBy: this.isAnonymous ? undefined : this.userId,
            text: this.text,
            reactions: this.ideaVotes.map((ideaVote) => ideaVote.frontendData),
            comments: this.ideaComments.map((ideaComment) => ideaComment.frontendData),
            createdAt: this.createdAt.toJSDate(),
            state: this.state,
            isOwner: false,
        };
    }

    getUserFrontendData(userId: number): IIdea {
        return {
            ...this.frontendData,
            isOwner: this.isOwner(userId),
        };
    }
}
