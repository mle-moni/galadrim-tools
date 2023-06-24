import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { GalaguerreTargetType } from 'libs/shared/dist'
import { DateTime } from 'luxon'

export default class GalaguerreTarget extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public type: GalaguerreTargetType

    @column()
    public comparisonId: number | null

    @column()
    public actionId: number | null

    @column()
    public boostId: number | null

    @column()
    public tagId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
