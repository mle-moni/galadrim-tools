import { _assertTrue } from '@galadrim-rooms/shared'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import {
    BaseModel,
    column,
    HasMany,
    hasMany,
    ManyToMany,
    manyToMany,
    ModelObject,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import RestaurantNote from './RestaurantNote'
import Tag from './Tag'

export default class Restaurant extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public description: string

    @column()
    public lat: number

    @column()
    public lng: number

    @attachment({ folder: 'restaurant', preComputeUrl: true })
    public image: AttachmentContract | null

    @manyToMany(() => Tag)
    public tags: ManyToMany<typeof Tag>

    @hasMany(() => RestaurantNote)
    public notes: HasMany<typeof RestaurantNote>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    toJSON(): ModelObject {
        return this.serialize({
            fields: {
                omit: ['created_at', 'updated_at'],
            },
            relations: {
                notes: {
                    fields: {
                        omit: ['created_at', 'updated_at'],
                    },
                },
                tags: {
                    fields: {
                        omit: ['created_at', 'updated_at'],
                    },
                },
            },
        })
    }

    static async fetchById(id: number) {
        const restaurants = await Restaurant.query()
            .where('id', id)
            .preload('tags')
            .preload('notes')

        _assertTrue(
            restaurants.length === 1,
            `expected restaurants.length to be '1' but got '${restaurants.length}'`
        )

        const restaurant = restaurants[0]

        return restaurant
    }
}
