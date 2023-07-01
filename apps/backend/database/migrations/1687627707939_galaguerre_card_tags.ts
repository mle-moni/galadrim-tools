import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_card_tags'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table
                .integer('card_id')
                .unsigned()
                .references('galaguerre_cards.id')
                .notNullable()
                .onDelete('CASCADE')

            table
                .integer('tag_id')
                .unsigned()
                .references('galaguerre_tags.id')
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