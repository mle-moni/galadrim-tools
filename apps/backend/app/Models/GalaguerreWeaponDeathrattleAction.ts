import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreWeaponDeathrattleAction extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public weaponId: number

    @column()
    public actionId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
