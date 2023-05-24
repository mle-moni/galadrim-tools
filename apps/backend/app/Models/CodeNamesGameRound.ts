import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class CodeNamesGameRound extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public gameId: number

    @column()
    public spyMasterId: number

    // words comma separated
    @column()
    public announce: string

    @column()
    public clueWord: string

    @column()
    public clueNumber: number

    @column()
    public red: number

    @column()
    public blue: number

    @column()
    public white: number

    // black represents the index of the black word, -1 if not used yet
    @column()
    public black: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
