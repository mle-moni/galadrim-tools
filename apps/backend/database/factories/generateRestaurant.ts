import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import Drive from '@ioc:Adonis/Core/Drive'
import { ApiClient } from '@japa/api-client'

import { faker } from '@faker-js/faker'
import Tag from 'App/Models/Tag'
import Restaurant from 'App/Models/Restaurant'
import RestaurantTag from 'App/Models/RestaurantTag'
import User from 'App/Models/User'
import RestaurantNote from 'App/Models/RestaurantNote'

const TagNames = ['coréen', 'japonais', 'chinois', 'mexicain', 'israélien']

const getRestaurantDto = async () => {
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
        averagePrice: faker.helpers.arrayElement([8, 11, 11.5, 12, 14.5, 16, null] as const),
    }
}

const getRestaurantTagsDto = (tags: Tag[], restaurant: Restaurant) => {
    const randomTags = faker.helpers.arrayElements(tags, 2)
    return randomTags.map((tag) => ({ tagId: tag.id, restaurantId: restaurant.id }))
}

const getRestaurantNoteDto = (users: User[], restaurant: Restaurant) => {
    return users.map((user) => ({
        restaurantId: restaurant.id,
        userId: user.id,
        note: faker.helpers.arrayElement(['1', '2', '3', '4', '5'] as const),
    }))
}

export const generateRestaurants = async (amount: number) => {
    const tags = await Tag.updateOrCreateMany(
        'name',
        TagNames.map((name) => ({ name }))
    )

    const restaurantDtos = await Promise.all(
        Array.from({ length: amount }).map(() => getRestaurantDto())
    )

    const restaurants = await Restaurant.createMany(restaurantDtos)

    const restaurantTagsDtos = restaurants.flatMap((restaurant) => {
        return getRestaurantTagsDto(tags, restaurant)
    })

    await RestaurantTag.createMany(restaurantTagsDtos)

    const users = await User.all()
    const restaurantNoteDtos = restaurants.flatMap((restaurant) => {
        return getRestaurantNoteDto(users, restaurant)
    })

    await RestaurantNote.createMany(restaurantNoteDtos)
}
