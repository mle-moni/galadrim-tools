import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { DateTime } from "luxon";

export default class Event extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @column()
    declare title: string;

    @column.dateTime()
    declare start: DateTime;

    @column.dateTime()
    declare end: DateTime;

    @column()
    declare room: string;

    @column()
    declare userId: number;
}
