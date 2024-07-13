import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Theme extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // who created this theme
  @column()
  declare userId: number | null

  @column()
  declare name: string

  @column()
  declare myEventsBg: string

  @column()
  declare myEventsBorder: string

  @column()
  declare myEventsText: string

  @column()
  declare otherEventsBg: string

  @column()
  declare otherEventsBorder: string

  @column()
  declare otherEventsText: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
