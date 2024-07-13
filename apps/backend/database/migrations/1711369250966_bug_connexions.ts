import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'bug_connexions'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table
                .integer('user_id')
                .notNullable()
                .unsigned()
                .references('users.id')
                .onDelete('CASCADE')

            table.string('room').notNullable()
            table.string('network_name').notNullable()
            table.text('details').nullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
