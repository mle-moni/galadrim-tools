import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Matrix extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare red: number

  @column()
  declare blue: number

  @column()
  declare white: number

  // black represents the index of the black word
  @column()
  declare black: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
