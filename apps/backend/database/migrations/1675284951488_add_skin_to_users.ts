import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "users";

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string("skin");
        });
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn("skin");
        });
    }
}
