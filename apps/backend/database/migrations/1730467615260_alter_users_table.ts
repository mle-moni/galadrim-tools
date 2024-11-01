import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "users";

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer("office_id").unsigned().references("offices.id").onDelete("SET NULL");

            this.defer(async (db) => {
                const firstOffice = await db.from("offices").first();
                if (!firstOffice) return;
                await db.from("users").update({ office_id: firstOffice.id });
            });
        });
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign("office_id");
            table.dropColumn("office_id");
        });
    }
}
