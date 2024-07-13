import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'
import CodeNamesGame from '#app/Models/CodeNamesGame'

const storeCodeNamesGameSchema = schema.create({
    redSpyMasterId: schema.number([rules.exists({ column: 'id', table: 'users' })]),
    blueSpyMasterId: schema.number([rules.exists({ column: 'id', table: 'users' })]),
    image: schema.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
})

export const storeCodeNamesGame = async ({ request }: HttpContext) => {
    const { blueSpyMasterId, redSpyMasterId, image } = await request.validate({
        schema: storeCodeNamesGameSchema,
    })

    const game = await CodeNamesGame.create({
        blueSpyMasterId,
        redSpyMasterId,
        image: Attachment.fromFile(image),
    })

    return { message: 'Partie créée', game }
}
