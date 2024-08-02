import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { DateTime } from "luxon";

export default class Notification extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column({
        prepare: (value: 0 | 1) => Boolean(value),
        serialize: (value: 0 | 1) => Boolean(value),
    })
    declare read: boolean;

    @column()
    declare title: string;

    @column()
    declare text: string;

    @column()
    declare link: string | null;

    @column()
    declare userId: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
