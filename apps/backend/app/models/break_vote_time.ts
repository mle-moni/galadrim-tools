import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class BreakVoteTime extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare breakVoteId: number;

    @column()
    declare breakTimeId: number;
}
