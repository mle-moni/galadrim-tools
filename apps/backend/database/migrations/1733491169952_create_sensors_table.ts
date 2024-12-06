import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "sensors";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.string("name").notNullable();
            table.string("sensor_id").notNullable();
            table
                .integer("office_room_id")
                .unsigned()
                .notNullable()
                .references("office_rooms.id")
                .onDelete("CASCADE");

            table.float("last_temp").notNullable().defaultTo(0);
            table.float("last_lux").notNullable().defaultTo(0);
            table.float("last_bat").notNullable().defaultTo(0);

            table.timestamp("created_at");
            table.timestamp("updated_at");
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
