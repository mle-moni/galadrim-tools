import { INotes, NotesOption } from '@galadrim-tools/shared'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class RestaurantNote extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public restaurantId: number

    @column()
    public userId: number

    @column()
    public note: NotesOption

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    get frontendData(): INotes {
        return {
            id: this.id,
            restaurantId: this.restaurantId,
            userId: this.userId,
            note: this.note,
            updatedAt: this.updatedAt.toString(),
        }
    }
}
