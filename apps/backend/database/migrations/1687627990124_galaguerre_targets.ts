import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_targets'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('type').notNullable()

            table
                .integer('comparison_id')
                .unsigned()
                .references('galaguerre_comparisons.id')
                .nullable()

            table.integer('action_id').unsigned().references('galaguerre_actions.id').notNullable()
            table.integer('boost_id').unsigned().references('galaguerre_boosts.id').notNullable()

            table.integer('tag_id').unsigned().references('galaguerre_tags.id').notNullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
