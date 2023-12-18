import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { RewindAdjective } from 'App/Controllers/Http/restaurantRewinds/utils/getAdjective'
import { RewindAnimal } from 'App/Controllers/Http/restaurantRewinds/utils/getAnimal'

export default class RestaurantRewind extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @column()
    public favoriteRestaurantId: number | null

    @column()
    public favoriteRestaurantCount: number | null

    @column()
    public dailyChoiceCount: number | null

    @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
    public restaurantPerTag: Record<string, number>

    @column()
    public restaurantAverageScore: number | null

    @column()
    public totalDistanceTravelled: number | null

    @column()
    public averageDistanceTravelled: number | null

    @column()
    public totalPrice: number | null

    @column()
    public averagePrice: number | null

    @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
    public personality: [RewindAnimal, RewindAdjective] | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
