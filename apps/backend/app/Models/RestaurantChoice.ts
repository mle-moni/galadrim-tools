import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { IChoice } from 'libs/shared/dist'
import { DateTime } from 'luxon'
import Restaurant from './Restaurant.js'
import { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class RestaurantChoice extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public restaurantId: number

    @belongsTo(() => Restaurant)
    public restaurant: BelongsTo<typeof Restaurant>

    @column()
    public userId: number

    @column()
    public day: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    get frontendData(): IChoice {
        return {
            id: this.id,
            restaurantId: this.restaurantId,
            userId: this.userId,
            createdAt: this.createdAt.toJSDate(),
        }
    }
}
