import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { RestaurantFactory } from '../factories/RestaurantFactory'

export default class RestaurantSeeder extends BaseSeeder {
    public static developmentOnly = true

    public async run() {
        await RestaurantFactory.createMany(10)
    }
}
