import { BaseModel, belongsTo, column, computed, hasMany } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import type { OfficeFloorConfig } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import Office from "./office.js";
import OfficeRoom from "./office_room.js";

export default class OfficeFloor extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare officeId: number;

    @belongsTo(() => Office)
    declare office: BelongsTo<typeof Office>;

    @column()
    declare floor: number;

    @column({
        prepare: (value) => JSON.stringify(value),
        consume: (value) => {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                } catch {
                    return {} as OfficeFloorConfig;
                }
            }
            return value as OfficeFloorConfig;
        },
    })
    declare config: OfficeFloorConfig;

    @computed()
    get computedName() {
        if (!this.office) return "Office was not preloaded";
        return `${this.office.name} - Etage ${this.floor}`;
    }

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @hasMany(() => OfficeRoom)
    declare rooms: HasMany<typeof OfficeRoom>;
}
