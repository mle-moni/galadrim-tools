import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_cards'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('label').notNullable()
            table.json('image').notNullable()
            table.integer('cost').notNullable()
            table.string('type').notNullable()

            table.string('card_mode').notNullable()

            table.integer('minion_id').unsigned().references('galaguerre_minions.id').nullable()
            table.integer('spell_id').unsigned().references('galaguerre_spells.id').nullable()
            table.integer('weapon_id').unsigned().references('galaguerre_weapons.id').nullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
