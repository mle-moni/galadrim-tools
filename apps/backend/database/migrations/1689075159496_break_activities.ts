import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'break_activities'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('name').notNullable()
            table.boolean('is_enabled').notNullable().defaultTo(true)

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
