import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_minion_deathrattle_actions'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table
                .integer('minion_id')
                .unsigned()
                .references('galaguerre_minions.id')
                .notNullable()
                .onDelete('CASCADE')

            table
                .integer('action_id')
                .unsigned()
                .references('galaguerre_actions.id')
                .notNullable()
                .onDelete('CASCADE')

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
