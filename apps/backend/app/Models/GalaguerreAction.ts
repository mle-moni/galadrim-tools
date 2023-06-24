import { GalaguerreActionType } from '@galadrim-tools/shared'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreAction extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public type: GalaguerreActionType

    @column()
    public isTargeted: boolean

    @column()
    public drawCount: number | null

    @column()
    public drawCardFilterId: number | null

    @column()
    public enemyDrawCount: number | null

    @column()
    public enemyDrawCardFilterId: number | null

    @column()
    public damage: number | null

    @column()
    public heal: number | null

    @column()
    public attackBoost: number | null

    @column()
    public healthBoost: number | null

    @column()
    public minionPowerId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
