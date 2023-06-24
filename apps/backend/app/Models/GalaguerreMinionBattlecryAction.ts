import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreMinionBattlecryAction extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public minionId: number

    @column()
    public actionId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
