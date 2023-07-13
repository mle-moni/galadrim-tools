import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BreakVoteTime extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public breakVoteId: number

    @column()
    public breakTimeId: number
}
