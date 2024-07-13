import { RIGHTS } from '@galadrim-tools/shared'
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Users extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.bigInteger('rights').defaultTo(RIGHTS.DEFAULT)
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('rights')
        })
    }
}
