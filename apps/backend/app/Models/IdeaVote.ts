import { IIdeaNote } from '@galadrim-tools/shared'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class IdeaVote extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column({
        prepare: (value: 0 | 1) => Boolean(value),
        serialize: (value: 0 | 1) => Boolean(value),
    })
    public isUpvote: boolean

    @column()
    public userId: number

    @column()
    public ideaId: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    get frontendData(): IIdeaNote {
        return {
            ideaId: this.ideaId,
            isUpvote: Boolean(this.isUpvote),
            userId: this.userId,
        }
    }
}
