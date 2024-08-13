import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "auth_access_tokens";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");
            table
                .integer("tokenable_id")
                .unsigned()
                .notNullable()
                .references("users.id")
                .onDelete("CASCADE");

            table.string("type").notNullable();
            table.string("name").nullable();
            table.string("hash").notNullable();
            table.text("abilities").notNullable();
            table.timestamp("created_at");
            table.timestamp("updated_at");
            table.timestamp("last_used_at").nullable();
            table.timestamp("expires_at").nullable();

            this.defer(async (db) => {
                const oldTokens = (await db.from("api_tokens")) as OldApiToken[];
                const newTokensDto = oldTokens.map((oldToken) => ({
                    tokenable_id: oldToken.user_id,
                    type: "auth_token",
                    name: null,
                    hash: oldToken.token,
                    abilities: JSON.stringify(["*"]),
                    created_at: oldToken.created_at,
                    updated_at: oldToken.created_at,
                    last_used_at: null,
                    expires_at: oldToken.expires_at,
                }));

                await db.table(this.tableName).multiInsert(newTokensDto);

                await db.rawQuery("DROP TABLE IF EXISTS api_tokens");
            });
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

type OldApiToken = {
    id: number;
    user_id: number;
    name: string;
    type: string;
    token: string;
    expires_at: string | null;
    created_at: string;
};
