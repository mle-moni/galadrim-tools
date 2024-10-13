import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { OfficeRoomConfig } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import OfficeFloor from "./office_floor.js";

export default class OfficeRoom extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare officeFloorId: number;

    @belongsTo(() => OfficeFloor, { serializeAs: null })
    declare officeFloor: BelongsTo<typeof OfficeFloor>;

    @column()
    declare name: string;

    @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
    declare config: OfficeRoomConfig;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
