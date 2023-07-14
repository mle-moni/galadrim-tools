import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BreakVoteActivity extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public breakActivityId: number

    @column()
    public breakVoteId: number
}
