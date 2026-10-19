import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    async up() {
        this.schema.alterTable("room_reservations", (table) => {
            table.integer("integration_version").unsigned().notNullable().defaultTo(1);
            // Existing ongoing bookings get a conservative new allocation anchor.
            table.dateTime("allocation_at").notNullable().defaultTo(this.now());
            table.index(["office_room_id", "start", "end"], "room_allocation_window_idx");
        });
        this.schema.createTable("forest_room_requests", (table) => {
            table.integer("principal_id").unsigned().notNullable();
            table.string("request_id", 36).notNullable();
            table.string("operation", 16).notNullable();
            table.string("payload_hash", 64).notNullable();
            table.json("result").notNullable();
            table.dateTime("issued_at", { precision: 3 }).notNullable();
            table.dateTime("created_at", { precision: 3 }).notNullable();
            table.primary(["principal_id", "request_id"]);
            table.index(["created_at"]);
        });
    }

    async down() {
        throw new Error(
            "Preserve reservation versions and command receipts; use a reviewed forward migration instead of destructive rollback.",
        );
    }
}
