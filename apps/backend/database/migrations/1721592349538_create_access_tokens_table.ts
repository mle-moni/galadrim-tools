import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "auth_access_tokens";

    async up() {
        this.schema.dropTableIfExists("api_tokens");
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");
            table.integer("tokenable_id").notNullable().references("users.id").onDelete("CASCADE");

            table.string("type").notNullable();
            table.string("name").nullable();
            table.string("hash").notNullable();
            table.text("abilities").notNullable();
            table.timestamp("created_at");
            table.timestamp("updated_at");
            table.timestamp("last_used_at").nullable();
            table.timestamp("expires_at").nullable();
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);

        this.schema.createTable("api_tokens", (table) => {
            table.increments("id").primary();
            table
                .integer("user_id")
                .unsigned()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.string("name").notNullable();
            table.string("type").notNullable();
            table.string("token", 64).notNullable().unique();

            /**
             * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp("expires_at", { useTz: true }).nullable();
            table.timestamp("created_at", { useTz: true }).notNullable();
        });
    }
}
