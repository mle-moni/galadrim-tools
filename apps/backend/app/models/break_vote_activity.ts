import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class BreakVoteActivity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare breakActivityId: number

  @column()
  declare breakVoteId: number
}
