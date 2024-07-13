import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'themes'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            // who created this theme
            table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')

            table.string('name').notNullable()

            table.string('my_events_bg').notNullable()
            table.string('my_events_border').notNullable()
            table.string('my_events_text').notNullable()

            table.string('other_events_bg').notNullable()
            table.string('other_events_border').notNullable()
            table.string('other_events_text').notNullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
