import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Matrix extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public red: number

    @column()
    public blue: number

    @column()
    public white: number

    // black represents the index of the black word
    @column()
    public black: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
