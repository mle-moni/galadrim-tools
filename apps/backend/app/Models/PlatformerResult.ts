import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class PlatformerResult extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public mapId: number

    @column()
    public userId: number

    @column()
    public score: number

    @column()
    public jumps: number

    @column()
    public time: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
