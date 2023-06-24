import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreMinion extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public health: number

    @column()
    public attack: number

    @column()
    public minionPowerId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
