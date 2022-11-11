import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

const updateProfileSchema = schema.create({
    email: schema.string([rules.trim()]),
    username: schema.string([rules.trim()]),
    image: schema.file.optional({ extnames: ['jpg', 'png', 'jpeg'], size: '1mb' }),
})

export const updateProfileRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!
    const { email, username, image } = await request.validate({
        schema: updateProfileSchema,
    })

    user.email = email
    user.username = username
    const finalImage = image ? Attachment.fromFile(image) : undefined

    if (finalImage) {
        user.image = finalImage
    }

    await user.save()

    return auth.user?.userData()
}
