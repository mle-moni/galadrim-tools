import { BaseModel, column, ManyToMany, manyToMany, ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
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

    @column()
    public image: string

    @manyToMany(() => Tag)
    public tags: ManyToMany<typeof Tag>

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
                tags: {
                    fields: {
                        omit: ['created_at', 'updated_at'],
                    },
                },
            },
        })
    }
}
