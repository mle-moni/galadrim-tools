import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
    protected tableName = "restaurant_rewinds";

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.integer("user_id").unsigned().references("users.id").onDelete("CASCADE");

            table
                .integer("favorite_restaurant_id")
                .unsigned()
                .references("restaurants.id")
                .onDelete("CASCADE");

            table.integer("favorite_restaurant_count").unsigned().defaultTo(0);

            table.integer("daily_choice_count").unsigned().defaultTo(0);

            table.json("restaurant_per_tag").nullable();
            table.float("restaurant_average_score").nullable();

            table.integer("total_distance_travelled").nullable();
            table.integer("average_distance_travelled").nullable();

            table.integer("total_price").nullable();
            table.integer("average_price").nullable();

            table.json("personality").nullable();

            table.timestamp("created_at", { useTz: true });
            table.timestamp("updated_at", { useTz: true });
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
