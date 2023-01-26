import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { RestaurantFactory } from '../factories/RestaurantFactory'

export default class RestaurantSeeder extends BaseSeeder {
    public static environment = ['development']

    public async run() {
        await RestaurantFactory.createMany(7)
    }
}
