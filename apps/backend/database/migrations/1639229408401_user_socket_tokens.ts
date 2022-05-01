import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('socket_token').defaultTo('')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('socket_token')
        })
    }
}
