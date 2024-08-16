import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "portrait_guessables";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.integer("id").unsigned().primary();
            table.string("picture_url").notNullable();
            table.string("guess").notNullable();
            table.timestamp("created_at", { useTz: true });
            table.timestamp("updated_at", { useTz: true });
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
