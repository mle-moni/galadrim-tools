import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'poll_options'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
            table.integer('poll_id').unsigned().references('polls.id').onDelete('CASCADE')

            table.string('option_type').notNullable()
            table.string('option_text').nullable()
            table.dateTime('option_date').nullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
