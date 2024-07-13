import { BaseSchema } from "@adonisjs/lucid/schema";

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

            table
                .integer('break_time_id')
                .notNullable()
                .unsigned()
                .references('break_times.id')
                .onDelete('CASCADE')
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
