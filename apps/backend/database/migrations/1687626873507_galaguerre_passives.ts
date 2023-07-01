import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_passives'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('type').notNullable()
            table.string('triggers_on').nullable()

            table
                .integer('action_id')
                .unsigned()
                .references('galaguerre_actions.id')
                .nullable()
                .onDelete('CASCADE')

            table
                .integer('boost_id')
                .unsigned()
                .references('galaguerre_boosts.id')
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
