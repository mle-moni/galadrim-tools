import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Event extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column()
    public title: string

    @column.dateTime()
    public start: DateTime

    @column.dateTime()
    public end: DateTime

    @column()
    public room: string
}
