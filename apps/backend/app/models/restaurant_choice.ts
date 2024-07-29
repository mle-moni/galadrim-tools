import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { IChoice } from '@galadrim-tools/shared'
import { DateTime } from 'luxon'
import Restaurant from './restaurant.js'

export default class RestaurantChoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare restaurantId: number

  @belongsTo(() => Restaurant)
  declare restaurant: BelongsTo<typeof Restaurant>

  @column()
  declare userId: number

  @column()
  declare day: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  get frontendData(): IChoice {
    return {
      id: this.id,
      restaurantId: this.restaurantId,
      userId: this.userId,
      createdAt: this.createdAt.toJSDate(),
    }
  }
}
