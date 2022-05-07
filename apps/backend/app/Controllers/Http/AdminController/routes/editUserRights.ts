import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from '../../../../Models/User'

const editUserRightsSchema = schema.create({
    id: schema.number(),
    rights: schema.number(),
})

export const editUserRightsRoute = async ({ request, response }: HttpContextContract) => {
    const { id, rights } = await request.validate({
        schema: editUserRightsSchema,
        messages: {
            'id.required': `L'id de l'utilisateur est requis`,
            'id.number': `L'id doit être un nombre`,
            'rights.required': `Le champ 'droits' est requis`,
            'rights.number': `Le champ 'droits' doit être un entier`,
        },
    })
    const user = await User.find(id)
    if (!user) {
        return response.badRequest({ error: `impossible de trouver l'utilisateur avec l'id ${id}` })
    }
    user.rights = rights
    await user.save()
    return { notification: 'Les droits ont été mis à jour' }
}
