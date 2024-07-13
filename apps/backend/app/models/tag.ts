import { BaseModel, column } from '@adonisjs/lucid/orm'
import { ITag } from '@galadrim-tools/shared'
import { DateTime } from 'luxon'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  get frontendData(): ITag {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
