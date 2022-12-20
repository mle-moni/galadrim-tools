import { AllRights, hasRights, hasSomeRights, IUserData } from '@galadrim-tools/shared'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import {
    BaseModel,
    beforeFind,
    beforeSave,
    column,
    hasMany,
    HasMany,
    ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import { formatDateToNumber } from 'App/Services/Date'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import { URL } from 'url'
import RestaurantChoice from './RestaurantChoice'

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public username: string

    @column({ serializeAs: null })
    public password: string

    @column()
    public email: string

    @column()
    public imageUrl: string

    @column()
    public otpToken: string | null

    @column()
    public rememberMeToken: string | null

    @column()
    public socketToken: string

    @column()
    public rights: number

    @attachment({ folder: 'avatar', preComputeUrl: true })
    public image: AttachmentContract | null

    @hasMany(() => RestaurantChoice)
    public choices: HasMany<typeof RestaurantChoice>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeFind()
    public static autoLoadParametersFind(query: ModelQueryBuilderContract<typeof User>) {
        query.preload('choices')
    }

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }

    get imageSrc() {
        if (this.image) {
            const backendUrl = Env.get('BACKEND_URL')
            const joinedPath = new URL(this.image.url, backendUrl).toString()
            return joinedPath
        }
        return this.imageUrl
    }

    get shortData() {
        return {
            id: this.id,
            username: this.username,
            imageUrl: this.imageSrc,
        }
    }

    public static getPersonalSocketFromId(id: number) {
        return `user-${id}`
    }

    get personalSocket() {
        return User.getPersonalSocketFromId(this.id)
    }

    get dailyChoice() {
        return (
            this.choices.find((choice) => choice.day === formatDateToNumber(new Date()))
                ?.restaurantId ?? null
        )
    }

    public userData(): IUserData {
        this.socketToken = nanoid()
        this.save()
        return {
            id: this.id,
            username: this.username,
            socketToken: this.socketToken,
            imageUrl: this.imageSrc,
            rights: this.rights,
            email: this.email,
            dailyChoice: this.dailyChoice,
        }
    }

    public hasRights(rightsWanted: AllRights[]) {
        return hasRights(this.rights, rightsWanted)
    }

    public hasSomeRights(rightsWanted: AllRights[]) {
        return hasSomeRights(this.rights, rightsWanted)
    }

    public getRightsData() {
        return { id: this.id, username: this.username, rights: this.rights }
    }
}
