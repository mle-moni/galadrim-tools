import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import GalaguerreMinionBattlecryAction from 'App/Models/GalaguerreMinionBattlecryAction'
import GalaguerreMinionDeathrattleAction from 'App/Models/GalaguerreMinionDeathrattleAction'
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

    @hasMany(() => GalaguerreMinionBattlecryAction)
    public battlecries: HasMany<typeof GalaguerreMinionBattlecryAction>

    @hasMany(() => GalaguerreMinionDeathrattleAction)
    public deathrattles: HasMany<typeof GalaguerreMinionDeathrattleAction>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
