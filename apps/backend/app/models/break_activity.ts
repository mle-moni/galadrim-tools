import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { DateTime } from "luxon";
import { BOOLEAN_COLUMN } from "../helpers/columns.js";

export default class BreakActivity extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare name: string;

    @column(BOOLEAN_COLUMN)
    declare is_enabled: boolean;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
