import { GalaguerrePassiveTriggersOn, GalaguerrePassiveType } from '@galadrim-tools/shared'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerrePassive extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public type: GalaguerrePassiveType

    @column()
    public triggersOn: GalaguerrePassiveTriggersOn | null

    @column()
    public actionId: number | null

    @column()
    public boostId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
