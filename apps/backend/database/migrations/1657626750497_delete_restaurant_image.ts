import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Restaurants extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('image')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('image').defaultTo('/default/restaurant.svg')
        })
    }
}
