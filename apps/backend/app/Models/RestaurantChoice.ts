import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { IChoice } from 'libs/shared/dist'
import { DateTime } from 'luxon'

export default class RestaurantChoice extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public restaurantId: number

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
