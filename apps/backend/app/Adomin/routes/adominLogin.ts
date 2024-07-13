import { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'

const loginSchema = schema.create({
    email: schema.string(),
    password: schema.string(),
})

export const adominLogin = async ({ auth, request }: HttpContext) => {
    const { email, password } = await request.validate({
        schema: loginSchema,
    })
    const token = await auth.use('api').attempt(email, password)

    return token
}
