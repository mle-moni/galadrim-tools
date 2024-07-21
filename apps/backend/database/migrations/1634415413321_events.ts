import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Events extends BaseSchema {
  protected tableName = 'events'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.string('title', 100)
      table.dateTime('start')
      table.dateTime('end')
      table.string('room')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
