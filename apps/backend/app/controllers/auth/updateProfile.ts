import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'
import Ws from '#app/Services/Ws'

const updateProfileSchema = schema.create({
    email: schema.string([rules.trim()]),
    username: schema.string([rules.trim()]),
    image: schema.file.optional({ extnames: ['jpg', 'png', 'jpeg'], size: '1mb' }),
})

export const updateProfileRoute = async ({ request, auth }: HttpContext) => {
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

    Ws.io.to('connectedSockets').emit('updateUser', user.shortData)

    await auth.user?.load('notifications')

    return auth.user?.userData()
}
