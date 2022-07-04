import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Places extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('name')
            table.text('description')
            table.decimal('lat', 10, 8)
            table.decimal('lng', 11, 8)

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
