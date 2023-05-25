import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import CodeNamesGameRound from 'App/Models/CodeNamesGameRound'
import { DateTime } from 'luxon'

export default class CodeNamesGame extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public redSpyMasterId: number

    @column()
    public blueSpyMasterId: number

    @column({
        prepare: (value: 0 | 1) => Boolean(value),
        serialize: (value: 0 | 1) => Boolean(value),
    })
    public isOver: boolean

    @attachment({ folder: 'codeNames', preComputeUrl: true })
    public image: AttachmentContract | null

    @hasMany(() => CodeNamesGameRound, { foreignKey: 'gameId' })
    public rounds: HasMany<typeof CodeNamesGameRound>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
