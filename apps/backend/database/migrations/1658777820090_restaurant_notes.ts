import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RestaurantNotes extends BaseSchema {
    protected tableName = 'restaurant_notes'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('restaurant_id').unsigned().references('restaurants.id')
            table.integer('user_id').unsigned().references('users.id')
            table.enum('note', [1, 2, 3, 4, 5])

            table.unique(['restaurant_id', 'user_id'])

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
