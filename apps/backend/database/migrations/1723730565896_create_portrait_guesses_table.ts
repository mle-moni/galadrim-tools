import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "portrait_guesses";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id").primary();
            table.integer("user_id").unsigned().references("users.id");
            table.integer("portrait_guessable_id").unsigned().references("portrait_guessables.id");
            table.timestamp("due", { useTz: true }).notNullable();
            table.json("fsrs_card").notNullable();
            table.timestamp("created_at", { useTz: true });
            table.timestamp("updated_at", { useTz: true });
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
