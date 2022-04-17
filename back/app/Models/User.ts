import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'

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
    public imageUrl: string | null

    @column()
    public otpToken: string | null

    @column()
    public rememberMeToken: string | null

    @column()
    public socketToken: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }

    public userData() {
        this.socketToken = nanoid()
        this.save()
        return {
            id: this.id,
            username: this.username,
            socketToken: this.socketToken,
            imageUrl: this.imageUrl,
        }
    }
}
