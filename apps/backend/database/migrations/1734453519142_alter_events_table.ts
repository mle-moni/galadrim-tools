import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "events";
    private oldTableName = "archived_events";

    async up() {
        this.schema.renameTable(this.tableName, this.oldTableName);
    }

    async down() {
        this.schema.renameTable(this.oldTableName, this.tableName);
    }
}
