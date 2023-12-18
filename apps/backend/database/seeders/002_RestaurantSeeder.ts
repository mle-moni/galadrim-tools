import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { generateRestaurants } from '../factories/generateRestaurant'

export default class RestaurantSeeder extends BaseSeeder {
    public static environment = ['development']

    public async run() {
        await generateRestaurants(50)
    }
}
