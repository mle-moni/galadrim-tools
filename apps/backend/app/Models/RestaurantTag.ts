import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class RestaurantTag extends BaseModel {
    public static table = 'restaurant_tag'

    @column({ isPrimary: true })
    public id: number

    @column()
    public tagId: number

    @column()
    public restaurantId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
