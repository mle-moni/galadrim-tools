import { test } from '@japa/runner'

test('test home page', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertBody({
        service: 'galadrim tools backend',
    })
})
