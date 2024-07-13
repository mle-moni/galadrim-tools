import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import {
    BaseModel,
    beforeFetch,
    column,
    hasMany,
    manyToMany
} from '@adonisjs/lucid/orm'
import RestaurantReview from '#app/Models/RestaurantReview'
import { formatDateToNumber } from '#app/Services/Date'
import { DateTime } from 'luxon'
import RestaurantChoice from './RestaurantChoice.js'
import RestaurantNote from './RestaurantNote.js'
import Tag from './Tag.js'
import { HasMany } from "@adonisjs/lucid/types/relations";
import { ManyToMany } from "@adonisjs/lucid/types/relations";
import { ModelQueryBuilderContract } from " @adonisjs/lucid/types/model";

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

    @column()
    public websiteLink: string | null

    @column()
    public averagePrice: number | null

    @column()
    public userId: number

    @attachment({ folder: 'restaurant', preComputeUrl: true })
    public image: AttachmentContract | null

    @manyToMany(() => Tag)
    public tags: ManyToMany<typeof Tag>

    @hasMany(() => RestaurantNote)
    public notes: HasMany<typeof RestaurantNote>

    @hasMany(() => RestaurantChoice)
    public choices: HasMany<typeof RestaurantChoice>

    @hasMany(() => RestaurantReview)
    public reviews: HasMany<typeof RestaurantReview>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    get dailyChoices() {
        return this.choices
            .filter((choice) => choice.day === formatDateToNumber(new Date()))
            .map((choice) => choice.userId)
    }

    @beforeFetch()
    public static autoLoadParameters(query: ModelQueryBuilderContract<typeof Restaurant>) {
        query.preload('tags')
        query.preload('notes')
        query.preload('choices')
        query.preload('reviews')
    }

    get frontendData() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            lat: this.lat,
            lng: this.lng,
            websiteLink: this.websiteLink,
            averagePrice: this.averagePrice,
            userId: this.userId,
            image: this.image,
            tags: this.tags.map((tag) => tag.frontendData),
            notes: this.notes.map((note) => note.frontendData),
            choices: this.dailyChoices,
            reviews: this.reviews,
            createdAt: this.createdAt.toJSDate(),
        }
    }

    static async fetchById(id: number) {
        const restaurant = await Restaurant.findOrFail(id)

        await restaurant.load((builder) =>
            builder.preload('tags').preload('notes').preload('choices').preload('reviews')
        )

        return restaurant.frontendData
    }
}
