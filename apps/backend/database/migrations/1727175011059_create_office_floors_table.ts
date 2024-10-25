import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "office_floors";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.integer("floor").notNullable();

            table.json("config").notNullable();

            table
                .integer("office_id")
                .unsigned()
                .notNullable()
                .references("offices.id")
                .onDelete("CASCADE");

            table.timestamp("created_at");
            table.timestamp("updated_at");

            table.unique(["office_id", "floor"]);
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
