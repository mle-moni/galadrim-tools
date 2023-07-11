import { BaseModel, HasManyThrough, column, hasManyThrough } from '@ioc:Adonis/Lucid/Orm'
import BreakActivity from 'App/Models/BreakActivity'
import BreakVoteActivity from 'App/Models/BreakVoteActivity'
import { DateTime } from 'luxon'

export default class BreakVote extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @hasManyThrough([() => BreakActivity, () => BreakVoteActivity])
    public activities: HasManyThrough<typeof BreakActivity>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
