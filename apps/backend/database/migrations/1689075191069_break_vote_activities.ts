import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'break_vote_activities'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('break_activity_id')
        .notNullable()
        .unsigned()
        .references('break_activities.id')
        .onDelete('CASCADE')

      table
        .integer('break_vote_id')
        .notNullable()
        .unsigned()
        .references('break_votes.id')
        .onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
