import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_minions'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('health').notNullable()
            table.integer('attack').notNullable()

            table
                .integer('minion_power_id')
                .unsigned()
                .references('galaguerre_minion_powers.id')
                .nullable()
                .onDelete('CASCADE')

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
