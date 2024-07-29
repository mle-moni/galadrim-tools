import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class CodeNamesGameRound extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare spyMasterId: number

  // words comma separated
  @column()
  declare announce: string

  @column()
  declare clueWord: string

  @column()
  declare clueNumber: number

  @column()
  declare red: number

  @column()
  declare blue: number

  @column()
  declare white: number

  // black represents the index of the black word, -1 if not used yet
  @column()
  declare black: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
