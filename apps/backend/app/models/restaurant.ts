import { ATTACHMENT_COLUMN } from '#services/attachment'
import { formatDateToNumber } from '#services/date'
import { BaseModel, beforeFetch, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { IImage } from '@galadrim-tools/shared'
import { DateTime } from 'luxon'
import RestaurantChoice from './restaurant_choice.js'
import RestaurantNote from './restaurant_note.js'
import RestaurantReview from './restaurant_review.js'
import Tag from './tag.js'

export default class Restaurant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare lat: number

  @column()
  declare lng: number

  @column()
  declare websiteLink: string | null

  @column()
  declare averagePrice: number | null

  @column()
  declare userId: number

  @column(ATTACHMENT_COLUMN)
  declare image: IImage | null

  @manyToMany(() => Tag)
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => RestaurantNote)
  declare notes: HasMany<typeof RestaurantNote>

  @hasMany(() => RestaurantChoice)
  declare choices: HasMany<typeof RestaurantChoice>

  @hasMany(() => RestaurantReview)
  declare reviews: HasMany<typeof RestaurantReview>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  get dailyChoices() {
    return this.choices
      .filter((choice) => choice.day === formatDateToNumber(new Date()))
      .map((choice) => choice.userId)
  }

  @beforeFetch()
  static autoLoadParameters(query: ModelQueryBuilderContract<typeof Restaurant>) {
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
