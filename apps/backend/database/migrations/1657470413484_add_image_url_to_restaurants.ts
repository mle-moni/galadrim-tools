import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Restaurants extends BaseSchema {
    protected tableName = 'restaurants'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('image').defaultTo('/default/restaurant.svg')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('image')
        })
    }
}
