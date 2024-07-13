import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'code_names_game_rounds'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('game_id').unsigned().references('code_names_games.id')
            table.integer('spy_master_id').unsigned().references('users.id')

            table.string('announce').defaultTo('')

            table.string('clue_word').notNullable()
            table.integer('clue_number').notNullable()

            table.integer('red').notNullable()
            table.integer('blue').notNullable()
            table.integer('white').notNullable()
            table.integer('black').notNullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
