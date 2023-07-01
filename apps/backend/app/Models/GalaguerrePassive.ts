import { GalaguerrePassiveTriggersOn, GalaguerrePassiveType } from '@galadrim-tools/shared'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerrePassive extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public type: GalaguerrePassiveType

    // triggersOn must not be NULL if type = ACTION
    @column()
    public triggersOn: GalaguerrePassiveTriggersOn | null

    @column()
    public actionId: number | null

    // e.g. "While this minion is alive, give it +1/+1 to other minions"
    // for active boosts, use actionId instead
    @column()
    public boostId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
