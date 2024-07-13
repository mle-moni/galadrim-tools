import BaseSeeder from '@adonisjs/lucid/seeders'
import { generateRestaurants } from '../factories/generateRestaurant'

export default class RestaurantSeeder extends BaseSeeder {
    public static environment = ['development']

    public async run() {
        await generateRestaurants(50)
    }
}
