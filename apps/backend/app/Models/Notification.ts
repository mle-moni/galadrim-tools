import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Notification extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column({
        prepare: (value: 0 | 1) => Boolean(value),
        serialize: (value: 0 | 1) => Boolean(value),
    })
    public read: boolean

    @column()
    public title: string

    @column()
    public text: string

    @column()
    public link: string | null

    @column()
    public userId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
