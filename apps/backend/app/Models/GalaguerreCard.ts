import { GalaguerreCardMode, GalaguerreCardType } from '@galadrim-tools/shared'
import { AttachmentContract, attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class GalaguerreCard extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public label: string

    @attachment({ folder: 'galaguerre', preComputeUrl: true })
    public image: AttachmentContract | null

    @column()
    public cost: number

    @column()
    public type: GalaguerreCardType

    @column()
    public cardMode: GalaguerreCardMode

    @column()
    public minionId: number | null

    @column()
    public spellId: number | null

    @column()
    public weaponId: number | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
