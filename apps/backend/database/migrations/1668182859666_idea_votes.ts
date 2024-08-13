import { BaseSchema } from "@adonisjs/lucid/schema";

export default class IdeaVotes extends BaseSchema {
    protected tableName = "idea_votes";

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.boolean("is_upvote").defaultTo(true);

            table.integer("user_id").unsigned().references("users.id").onDelete("CASCADE");
            table.integer("idea_id").unsigned().references("ideas.id").onDelete("CASCADE");

            table.unique(["user_id", "idea_id"]);

            table.timestamp("created_at", { useTz: true });
            table.timestamp("updated_at", { useTz: true });
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
