import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_rewinds'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_rank').nullable()
      table.integer('max_rank').notNullable().defaultTo(46)
      table.integer('wealth_rank').nullable()
      table.integer('distance_rank').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_rank')
      table.dropColumn('max_rank')
      table.dropColumn('wealth_rank')
      table.dropColumn('distance_rank')
    })
  }
}
