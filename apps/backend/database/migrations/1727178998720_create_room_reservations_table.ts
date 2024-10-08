import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "room_reservations";

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.string("title").nullable();
            table.dateTime("start").notNullable();
            table.dateTime("end").notNullable();

            table
                .integer("office_room_id")
                .unsigned()
                .notNullable()
                .references("office_rooms.id")
                .onDelete("CASCADE");

            table
                .integer("user_id")
                .unsigned()
                .notNullable()
                .references("users.id")
                .onDelete("CASCADE");

            table.timestamp("created_at");
            table.timestamp("updated_at");
        });
    }

    async down() {
        this.schema.dropTable(this.tableName);
    }
}
