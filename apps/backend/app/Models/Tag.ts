import { BaseModel, column, ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Tag extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

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
