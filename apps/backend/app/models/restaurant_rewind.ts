import { BaseModel, column } from '@adonisjs/lucid/orm'
import { RewindAdjective, RewindAnimal } from '@galadrim-tools/shared'
import { DateTime } from 'luxon'

export default class RestaurantRewind extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare favoriteRestaurantId: number | null

  @column()
  declare favoriteRestaurantCount: number | null

  @column()
  declare dailyChoiceCount: number | null

  @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
  declare restaurantPerTag: Record<string, number>

  @column()
  declare restaurantAverageScore: number | null

  @column()
  declare totalDistanceTravelled: number | null

  @column()
  declare averageDistanceTravelled: number | null

  @column()
  declare totalPrice: number | null

  @column()
  declare averagePrice: number | null

  @column()
  declare userRank: number | null

  @column()
  declare wealthRank: number | null

  @column()
  declare distanceRank: number | null

  @column()
  declare maxRank: number

  @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
  declare personality: [RewindAnimal, RewindAdjective] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
