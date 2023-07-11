import { BaseModel, HasMany, ManyToMany, column, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import BreakActivity from 'App/Models/BreakActivity'
import BreakVoteTime from 'App/Models/BreakVoteTime'
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

    @hasMany(() => BreakVoteTime)
    public times: HasMany<typeof BreakVoteTime>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
