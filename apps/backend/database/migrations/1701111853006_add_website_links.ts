import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('website_link')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('website_link')
        })
    }
}
