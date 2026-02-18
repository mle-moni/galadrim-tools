import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { OfficeRoomConfig } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import { BOOLEAN_COLUMN } from "../helpers/columns.js";
import OfficeFloor from "./office_floor.js";

export default class OfficeRoom extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare officeFloorId: number;

    @belongsTo(() => OfficeFloor)
    declare officeFloor: BelongsTo<typeof OfficeFloor>;

    @column()
    declare name: string;

    @column({
        prepare: (value) => JSON.stringify(value),
        consume: (value) => {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                } catch {
                    return { points: [] };
                }
            }
            return value as OfficeRoomConfig;
        },
    })
    declare config: OfficeRoomConfig;

    @column(BOOLEAN_COLUMN)
    declare isBookable: boolean;

    @column(BOOLEAN_COLUMN)
    declare isPhonebox: boolean;

    @column(BOOLEAN_COLUMN)
    declare hasTv: boolean;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
