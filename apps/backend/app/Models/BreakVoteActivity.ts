import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class BreakVoteActivity extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public breakActivityId: number

    @column()
    public breakVoteId: number
}
