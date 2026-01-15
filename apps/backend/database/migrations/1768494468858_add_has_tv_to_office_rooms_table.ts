import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "office_rooms";

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean("has_tv").notNullable().defaultTo(false);
        });
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn("has_tv");
        });
    }
}
