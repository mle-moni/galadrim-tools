import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'ideas'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('done')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('done').defaultTo(false).notNullable()
        })
    }
}
