import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

const changePasswordSchema = schema.create({
    password: schema.string({ trim: true }),
})

export const changePasswordRoute = async ({ request, auth }: HttpContextContract) => {
    const { password } = await request.validate({
        schema: changePasswordSchema,
    })
    const user = auth.user!
    user.password = password
    await user.save()
    return { notification: 'Le mot de passe à été modifié' }
}
