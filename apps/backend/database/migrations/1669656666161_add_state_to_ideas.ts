import { IDEAS_STATE } from '@galadrim-tools/shared'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ideas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enu('state', IDEAS_STATE).defaultTo('TODO').notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('state')
    })
  }
}
