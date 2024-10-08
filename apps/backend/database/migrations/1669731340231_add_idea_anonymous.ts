import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "ideas";

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean("is_anonymous").defaultTo(false).notNullable();
        });
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn("is_anonymous");
        });
    }
}
