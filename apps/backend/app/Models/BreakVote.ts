import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import BreakActivity from 'App/Models/BreakActivity'
import BreakTime from 'App/Models/BreakTime'
import { DateTime } from 'luxon'

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
