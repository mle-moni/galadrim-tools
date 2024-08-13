import { BaseModel, column, manyToMany } from "@adonisjs/lucid/orm";
import type { ManyToMany } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import BreakActivity from "./break_activity.js";
import BreakTime from "./break_time.js";

export default class BreakVote extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare userId: number;

    @manyToMany(() => BreakActivity, {
        pivotTable: "break_vote_activities",
    })
    declare activities: ManyToMany<typeof BreakActivity>;

    @manyToMany(() => BreakTime, {
        pivotTable: "break_vote_times",
    })
    declare times: ManyToMany<typeof BreakTime>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
