import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Restaurant from '../../app/Models/Restaurant'

export default class RestaurantSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Restaurant.createMany([
      { name: 'Wokantine', description: 'Restaurant wok à Paris', lat:48.8694613, lng:2.351466 },
      { name: 'Mcdo', description: 'Restaurant wok à Paris', lat:48.870938,  lng:2.347677 }
    ])
  }
}
