import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_actions'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('type').notNullable()
            table.boolean('is_targeted').notNullable()

            table.integer('draw_count').nullable()
            table
                .integer('draw_card_filter_id')
                .unsigned()
                .references('galaguerre_card_filters.id')
                .nullable()

            table.integer('enemy_draw_count').nullable()
            table
                .integer('enemy_draw_card_filter_id')
                .unsigned()
                .references('galaguerre_card_filters.id')
                .nullable()

            table.integer('damage').nullable()
            table.integer('heal').nullable()

            table.integer('boost_id').unsigned().references('galaguerre_boosts.id').nullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
