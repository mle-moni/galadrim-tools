import { BaseModel, column, hasMany, hasManyThrough } from "@adonisjs/lucid/orm";
import type { HasMany, HasManyThrough } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import OfficeFloor from "./office_floor.js";
import OfficeRoom from "./office_room.js";

export default class Office extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare name: string;

    @column()
    declare address: string;

    @column()
    declare lat: number;

    @column()
    declare lng: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @hasMany(() => OfficeFloor)
    declare officeFloors: HasMany<typeof OfficeFloor>;

    @hasManyThrough([() => OfficeRoom, () => OfficeFloor])
    declare rooms: HasManyThrough<typeof OfficeRoom>;
}
