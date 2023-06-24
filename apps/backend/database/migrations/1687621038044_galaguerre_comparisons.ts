import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'galaguerre_comparisons'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('cost_comparison').nullable()
            table.integer('cost').nullable()
            table.string('attack_comparison').nullable()
            table.integer('attack').nullable()
            table.string('health_comparison').nullable()
            table.integer('health').nullable()

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
