import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_boosts'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('health').nullable()
            table.integer('attack').nullable()
            table.integer('spell_power').nullable()

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
