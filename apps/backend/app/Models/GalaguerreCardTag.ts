import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreCardTag extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public cardId: number

    @column()
    public tagId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}