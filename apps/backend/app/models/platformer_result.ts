import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { DateTime } from "luxon";

export default class PlatformerResult extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare mapId: number;

    @column()
    declare userId: number;

    @column()
    declare score: number;

    @column()
    declare jumps: number;

    @column()
    declare time: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
