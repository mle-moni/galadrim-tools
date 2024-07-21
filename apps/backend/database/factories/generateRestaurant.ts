import Restaurant from '#models/restaurant'
import RestaurantNote from '#models/restaurant_note'
import RestaurantTag from '#models/restaurant_tag'
import Tag from '#models/tag'
import User from '#models/user'
import { imageAttachmentFromBuffer } from '#services/attachment'
import { cuid } from '@adonisjs/core/helpers'
import { faker } from '@faker-js/faker'
import { IImage } from '@galadrim-tools/shared'
import axios from 'axios'

const TagNames = ['coréen', 'japonais', 'chinois', 'mexicain', 'israélien']

const getRestaurantDto = async () => {
  const imageName = `restaurant/${cuid()}.png`
  const image: IImage = {
    name: imageName,
    url: `/uploads/${imageName}`,
  }
  const res = await axios.get(
    faker.image.urlLoremFlickr({ category: 'business', width: 800, height: 400 }),
    { responseType: 'arraybuffer' }
  )
  const buffer = res.data

  await imageAttachmentFromBuffer(buffer, imageName)

  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    lat: +faker.location.latitude({ min: 48.87755839830862, max: 48.86143981275648, precision: 8 }),
    lng: +faker.location.longitude({
      min: 2.364892959594727,
      max: 2.3366975784301762,
      precision: 8,
    }),
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
