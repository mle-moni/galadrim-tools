import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import Drive from '@ioc:Adonis/Core/Drive'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { ApiClient } from '@japa/api-client'

import Restaurant from '../../app/Models/Restaurant'

export const RestaurantFactory = Factory.define(Restaurant, async ({ faker }) => {
    const image = new Attachment({
        extname: 'png',
        mimeType: 'image/png',
        size: 10 * 1000,
        name: `restaurant/${faker.random.alphaNumeric(10)}.png`,
    })

    const client = new ApiClient()
    const res = await client.get(faker.image.business(800, 400, true))

    const imageFileContent = res.response.body
    await Drive.put(image.name, imageFileContent)

    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        lat: +faker.address.latitude(48.87755839830862, 48.86143981275648, 8),
        lng: +faker.address.longitude(2.364892959594727, 2.3366975784301762, 8),
        image,
    }
}).build()
