import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import OfficeRoom from "./office_room.js";
import User from "./user.js";

export default class RoomReservation extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare title: string;

    @column.dateTime()
    declare start: DateTime;

    @column.dateTime()
    declare end: DateTime;

    @column()
    declare officeRoomId: number;

    @belongsTo(() => OfficeRoom)
    declare room: BelongsTo<typeof OfficeRoom>;

    @column()
    declare userId: number;

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
