import { BaseModel, belongsTo, column, computed } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { OfficeConfig } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import Office from "./office.js";

export default class OfficeFloor extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare officeId: number;

    @belongsTo(() => Office)
    declare office: BelongsTo<typeof Office>;

    @column()
    declare floor: number;

    @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
    declare config: OfficeConfig;

    @computed()
    get computedName() {
        if (!this.office) return "Office was not preloaded";
        return `${this.office.name} - Etage ${this.floor}`;
    }

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
