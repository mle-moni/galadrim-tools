import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "offices";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.string("name").notNullable();
            table.string("address").notNullable();

            table.decimal("lat", 10, 8).notNullable();
            table.decimal("lng", 11, 8).notNullable();

            table.timestamp("created_at");
            table.timestamp("updated_at");
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
