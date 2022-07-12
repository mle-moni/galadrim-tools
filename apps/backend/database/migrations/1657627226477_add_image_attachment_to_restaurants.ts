import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Restaurants extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.json('image')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('image')
        })
    }
}
