import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "users";

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer("theme_id").unsigned().references("themes.id").onDelete("CASCADE");
        });
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign("theme_id");
            table.dropColumn("theme_id");
        });
    }
}
