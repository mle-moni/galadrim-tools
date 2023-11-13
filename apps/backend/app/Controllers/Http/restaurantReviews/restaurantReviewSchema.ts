import { schema } from '@ioc:Adonis/Core/Validator'

export const restaurantReviewSchema = schema.create({
    comment: schema.string(),
    image: schema.file.optional({ size: '1mb', extnames: ['jpg', 'png', 'jpeg'] }),
})
