import { IIdeaComment } from '@galadrim-tools/shared'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class IdeaComment extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public message: string

    @column()
    public userId: number

    @column()
    public ideaId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    get frontendData(): IIdeaComment {
        return {
            id: this.id,
            ideaId: this.ideaId,
            message: this.message,
            userId: this.userId,
            createdAt: this.createdAt.toJSDate(),
        }
    }
}
