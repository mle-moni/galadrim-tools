import {
    AllRights,
    hasRights,
    hasSomeRights,
    INotification,
    ITheme,
    IUserData,
} from '@galadrim-tools/shared'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'
import {
    BaseModel,
    beforeFind,
    beforeSave,
    belongsTo,
    column,
    hasMany
} from '@adonisjs/lucid/orm'
import Notification from '#app/Models/Notification'
import RestaurantNote from '#app/Models/RestaurantNote'
import Theme from '#app/Models/Theme'
import { formatDateToNumber } from '#app/Services/Date'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import { URL } from 'url'
import RestaurantChoice from './RestaurantChoice'
import { BelongsTo } from "@adonisjs/lucid/types/relations";
import { HasMany } from "@adonisjs/lucid/types/relations";
import { ModelQueryBuilderContract } from " @adonisjs/lucid/types/model";

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

    @column()
    public notificationsSettings: number

    @column()
    public skin: string | null

    @column()
    public themeId: number | null

    @attachment({ folder: 'avatar', preComputeUrl: true })
    public image: AttachmentContract | null

    @belongsTo(() => Theme)
    public theme: BelongsTo<typeof Theme>

    @hasMany(() => RestaurantChoice)
    public choices: HasMany<typeof RestaurantChoice>

    @hasMany(() => RestaurantNote)
    public notes: HasMany<typeof RestaurantNote>

    @hasMany(() => Notification)
    public notifications: HasMany<typeof Notification>

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
            user.password = await hash.make(user.password)
        }
    }

    get imageSrc() {
        if (this.image) {
            const backendUrl = env.get('BACKEND_URL')
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

        const notifications = this.notifications.sort(
            (a, b) => b.id - a.id
        ) as unknown as INotification[]

        const theme = (this.theme?.toJSON() ?? null) as ITheme | null

        return {
            id: this.id,
            username: this.username,
            socketToken: this.socketToken,
            imageUrl: this.imageSrc,
            rights: this.rights,
            notificationsSettings: this.notificationsSettings,
            email: this.email,
            dailyChoice: this.dailyChoice,
            notifications,
            skin: this.skin,
            theme,
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
