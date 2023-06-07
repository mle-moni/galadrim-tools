import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class IdeaComments extends BaseSchema {
    protected tableName = 'idea_comments'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.text('message')

            table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
            table.integer('idea_id').unsigned().references('ideas.id').onDelete('CASCADE')

            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
