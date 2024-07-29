import { ATTACHMENT_COLUMN } from '#services/attachment'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { IImage } from '@galadrim-tools/shared'
import { DateTime } from 'luxon'

export default class RestaurantReview extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare restaurantId: number

  @column()
  declare userId: number

  @column()
  declare comment: string

  @column(ATTACHMENT_COLUMN)
  declare image: IImage | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
