import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreBoost extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public health: number | null

    @column()
    public attack: number | null

    @column()
    public spellPower: number | null

    @column()
    public minionPowerId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
