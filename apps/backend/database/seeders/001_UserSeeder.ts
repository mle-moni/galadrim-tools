import { generateRights, RIGHTS } from '@galadrim-rooms/shared'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from '../../app/Models/User'

export default class UserSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        User.updateOrCreateMany('id', [
            {
                id: 1,
                username: 'test',
                email: 'test@test.fr',
                imageUrl: 'https://forest.galadrim.fr/img/users/default.png',
                password: 'test',
                rights: RIGHTS.DEFAULT,
            },
            {
                id: 2,
                username: 'miam',
                email: 'miam@miam.fr',
                imageUrl:
                    'https://static8.depositphotos.com/1010340/945/v/450/depositphotos_9459006-stock-illustration-chef-cartoon.jpg',
                password: 'miam',
                rights: generateRights(['MIAM_ADMIN']),
            },
            {
                id: 3,
                username: 'admin',
                email: 'admin@admin.fr',
                imageUrl: 'https://forest.galadrim.fr/img/users/105.jpg',
                password: 'admin',
                rights: generateRights([
                    'EVENT_ADMIN',
                    'MIAM_ADMIN',
                    'RIGHTS_ADMIN',
                    'USER_ADMIN',
                    'DASHBOARD_ADMIN',
                ]),
            },
        ])
    }
}
