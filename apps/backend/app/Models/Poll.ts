import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import PollOption from './PollOption'
import PollVote from './PollVote'

export default class Poll extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public question: string

    @hasMany(() => PollOption)
    public options: HasMany<typeof PollOption>

    @hasMany(() => PollVote)
    public votes: HasMany<typeof PollVote>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
