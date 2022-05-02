import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserSchema extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('email').nullable().unique()
            table.string('image_url').nullable()
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('email')
            table.dropColumn('image_url')
        })
    }
}
