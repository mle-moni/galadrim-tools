import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "office_rooms";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table
                .integer("office_floor_id")
                .unsigned()
                .notNullable()
                .references("office_floors.id")
                .onDelete("CASCADE");

            table.string("name").notNullable();

            table
                .json("config")
                .notNullable()
                .defaultTo(`{"width": 100, "height": 100, "x": 0, "y": 0}`);

            table.timestamp("created_at");
            table.timestamp("updated_at");
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
