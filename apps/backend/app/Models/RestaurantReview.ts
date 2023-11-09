import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class RestaurantReview extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public restaurantId: number

    @column()
    public userId: number

    @column()
    public comment: string

    @attachment({ folder: 'restaurantReviews', preComputeUrl: true })
    public image: AttachmentContract | null

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
