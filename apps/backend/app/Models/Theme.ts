import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Theme extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    // who created this theme
    @column()
    public userId: number | null

    @column()
    public name: string

    @column()
    public myEventsBg: string

    @column()
    public myEventsBorder: string

    @column()
    public myEventsText: string

    @column()
    public otherEventsBg: string

    @column()
    public otherEventsBorder: string

    @column()
    public otherEventsText: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
