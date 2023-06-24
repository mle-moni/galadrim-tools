import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreMinionPower extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public hasTaunt: boolean

    @column()
    public hasCharge: boolean

    @column()
    public hasWindfury: boolean

    @column()
    public isPoisonous: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
