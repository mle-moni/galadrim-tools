import { DEFAULT_NOTIFICATION_SETTINGS } from '@galadrim-tools/shared'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'
import axios from 'axios'
import crypto from 'crypto'
import { nanoid } from 'nanoid'

const ALGORITHM = 'aes-256-cbc'

export const galadrimEncrypt = (data: string) => {
    const secretKey = Env.get('GALADRIM_SECRET_KEY')

    if (!secretKey) return null

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        crypto.createHash('sha256').update(secretKey).digest(),
        iv
    )
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export const galadrimDecrypt = (encryptedData: string): string | null => {
    const secretKey = Env.get('GALADRIM_SECRET_KEY')

    if (!secretKey) return null

    const [ivHex, dataHex] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encrypted = Buffer.from(dataHex, 'hex')

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        crypto.createHash('sha256').update(secretKey).digest(),
        iv
    )
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return decrypted.toString('utf8')
}

const getUserEmailFromGaladrimCookie = async ({ request }: HttpContextContract) => {
    const emailCookie: string | null = request.cookiesList()['email-token']

    if (!emailCookie) return null
    try {
        const email = galadrimDecrypt(emailCookie)

        return email
    } catch (error) {
        return null
    }
}

const createUserFromEmail = async (email: string) => {
    const res = await axios.get(`https://forest.galadrim.fr/profileInfos?email=${email}`)
    if (res.status === 200) {
        const { username, userId } = res.data
        const user = await User.create({
            email,
            username,
            password: nanoid(),
            otpToken: nanoid(),
            notificationsSettings: DEFAULT_NOTIFICATION_SETTINGS,
            imageUrl: `https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/${userId}.jpg`,
        })

        return user
    }

    Logger.error('Error while creating user from email (forest responded non 200 code)', res.data)

    return null
}

export const getUserToAuthenticate = async (ctx: HttpContextContract) => {
    const email = await getUserEmailFromGaladrimCookie(ctx)

    if (!email) return null

    const user = await User.findBy('email', email)

    if (user) return user

    return createUserFromEmail(email)
}
