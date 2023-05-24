import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import CodeNamesGame from 'App/Models/CodeNamesGame'

const storeCodeNamesGameSchema = schema.create({
    redSpyMasterId: schema.number([rules.exists({ column: 'id', table: 'users' })]),
    blueSpyMasterId: schema.number([rules.exists({ column: 'id', table: 'users' })]),
    image: schema.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
})

export const storeCodeNamesGame = async ({ request }: HttpContextContract) => {
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
