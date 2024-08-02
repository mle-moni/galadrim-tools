import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Users extends BaseSchema {
    protected tableName = "users";

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.json("image");
        });
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn("image");
        });
    }
}
