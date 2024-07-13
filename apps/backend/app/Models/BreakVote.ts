import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import BreakActivity from '#app/Models/BreakActivity'
import BreakTime from '#app/Models/BreakTime'
import { DateTime } from 'luxon'
import { ManyToMany } from "@adonisjs/lucid/types/relations";

export default class BreakVote extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @manyToMany(() => BreakActivity, {
        pivotTable: 'break_vote_activities',
    })
    public activities: ManyToMany<typeof BreakActivity>

    @manyToMany(() => BreakTime, {
        pivotTable: 'break_vote_times',
    })
    public times: ManyToMany<typeof BreakTime>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
