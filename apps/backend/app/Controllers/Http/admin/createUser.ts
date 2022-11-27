import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { nanoid } from 'nanoid'

const createUserSchema = schema.create({
    email: schema.string([
        rules.trim(),
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
    ]),
    username: schema.string([rules.trim(), rules.unique({ table: 'users', column: 'username' })]),
})

export const createUserRoute = async ({ request }: HttpContextContract) => {
    const { email, username } = await request.validate({
        schema: createUserSchema,
        messages: {
            'email.required': 'Le champ email est requis',
            'email.email': `L'email fourni est invalide`,
            'email.unique': `Cet email est déjà utilisé`,
            'username.required': `Le nom d'utilisateur est requis`,
            'username.unique': `Ce nom d'utilisateur est déjà utilisé`,
        },
    })

    const otpToken = nanoid()
    // we will send an email with otp, so user can set his own password
    const user = await User.create({
        email,
        username,
        password: nanoid(),
        otpToken,
        imageUrl:
            'https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/0.jpg',
    })

    await Mail.use('mailgun').send((message) => {
        message
            .from(`<noreply@${Env.get('MAILGUN_DOMAIN')}>`)
            .to(user.email)
            .subject('Initialisation du mot de passe')
            .htmlView('emails/get_otp', {
                username: user.username,
                otp: user.otpToken,
            })
    })
    return { notification: `L'utilisateur ${user.username} a bien été créé` }
}
