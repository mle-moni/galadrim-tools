import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'break_vote_times'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table
                .integer('break_vote_id')
                .notNullable()
                .unsigned()
                .references('break_votes.id')
                .onDelete('CASCADE')

            table.time('time').notNullable()
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
