import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Restaurants extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('user_id').unsigned().references('users.id').defaultTo(1)
            table.double('average_price').nullable()
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('user_id')
            table.dropColumn('average_price')
        })
    }
}
