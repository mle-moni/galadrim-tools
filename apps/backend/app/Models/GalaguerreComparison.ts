import { GalaguerreComparisonType } from '@galadrim-tools/shared'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreComparison extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public costComparison: GalaguerreComparisonType | null

    @column()
    public cost: number | null

    @column()
    public attackComparison: GalaguerreComparisonType | null

    @column()
    public attack: number | null

    @column()
    public healthComparison: GalaguerreComparisonType | null

    @column()
    public health: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
