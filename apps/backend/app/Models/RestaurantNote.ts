import { NotesOption } from '@galadrim-rooms/shared'
import { BaseModel, column, ModelObject } from '@ioc:Adonis/Lucid/Orm'
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

    toJSON(): ModelObject {
        return this.serialize({
            fields: {
                omit: ['createdAt', 'updatedAt'],
            },
        })
    }
}
