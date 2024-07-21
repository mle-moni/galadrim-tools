import { CONNECTED_SOCKETS } from '#controllers/socket/socket_constants'
import { imageAttachmentFromFile } from '#services/attachment'
import { Ws } from '#services/ws'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'

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
  const finalImage = image ? await imageAttachmentFromFile(image, 'avatar') : undefined

  if (finalImage) {
    user.image = finalImage
  }

  await user.save()

  Ws.io.to(CONNECTED_SOCKETS).emit('updateUser', user.shortData)

  await auth.user?.load('notifications')

  return auth.user?.userData()
}
