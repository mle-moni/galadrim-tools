import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'code_names_games'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('red_spy_master_id').unsigned().references('users.id')
            table.integer('blue_spy_master_id').unsigned().references('users.id')

            table.json('image')

            table.boolean('is_over').defaultTo(false)

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
