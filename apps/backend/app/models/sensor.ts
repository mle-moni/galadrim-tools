import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import OfficeRoom from "./office_room.js";

export default class Sensor extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare name: string;

    @column()
    declare sensorId: string;

    @column()
    declare officeRoomId: number;

    @belongsTo(() => OfficeRoom)
    declare officeRoom: BelongsTo<typeof OfficeRoom>;

    @column()
    declare lastTemp: number;

    @column()
    declare lastLux: number;

    @column()
    declare lastBat: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
