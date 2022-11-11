import { IIdea } from '@galadrim-tools/shared'
import {
    BaseModel,
    beforeFind,
    column,
    HasMany,
    hasMany,
    ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import IdeaVote from '../../app/Models/IdeaVote'

export default class Idea extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @column()
    public text: string

    @hasMany(() => IdeaVote)
    public ideaVotes: HasMany<typeof IdeaVote>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeFind()
    public static autoLoadParameters(query: ModelQueryBuilderContract<typeof Idea>) {
        query.preload('ideaVotes')
    }

    get frontendData(): IIdea {
        return {
            id: this.id,
            createdBy: this.userId,
            text: this.text,
            reactions: this.ideaVotes.map(({ id, isUpvote, userId }) => ({
                ideaId: id,
                isUpvote,
                userId,
            })),
        }
    }
}
