import { DEFAULT_NOTIFICATION_SETTINGS } from '@galadrim-tools/shared'
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table
                .bigInteger('notifications_settings')
                .notNullable()
                .defaultTo(DEFAULT_NOTIFICATION_SETTINGS)
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('notifications_settings')
        })
    }
}
