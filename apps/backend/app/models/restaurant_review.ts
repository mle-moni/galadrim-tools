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

  // @attachment({ folder: 'restaurantReviews', preComputeUrl: true })
  @column()
  declare image: IImage | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
