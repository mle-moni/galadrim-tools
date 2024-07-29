import User from '#models/user'
import env from '#start/env'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@galadrim-tools/shared'
import axios from 'axios'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
import timers from 'node:timers/promises'

const EMAIL_CREATION_SET = new Set<string>()

const emailCreationPending = async (email: string) => {
  if (!EMAIL_CREATION_SET.has(email)) return 'ready'

  await timers.setTimeout(100)

  emailCreationPending(email)
}

const lockEmail = async (email: string) => {
  await emailCreationPending(email)
  EMAIL_CREATION_SET.add(email)
}

const unlockEmail = (email: string) => {
  EMAIL_CREATION_SET.delete(email)
}

const ALGORITHM = 'aes-256-cbc'

export const galadrimEncrypt = (data: string) => {
  const secretKey = env.get('GALADRIM_SECRET_KEY')

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
  const secretKey = env.get('GALADRIM_SECRET_KEY')

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

const getUserEmailFromGaladrimCookie = async ({ request }: HttpContext) => {
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
    const { username } = res.data
    await lockEmail(email)
    const user = await User.updateOrCreate(
      { email },
      {
        email,
        username,
        password: nanoid(),
        otpToken: nanoid(),
        notificationsSettings: DEFAULT_NOTIFICATION_SETTINGS,
        imageUrl: `https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/0.jpg`,
      }
    )
    unlockEmail(email)

    return user
  }

  logger.error('Error while creating user from email (forest responded non 200 code)', res.data)

  return null
}

export const getUserToAuthenticate = async (ctx: HttpContext) => {
  const email = await getUserEmailFromGaladrimCookie(ctx)

  if (!email) return null

  const user = await User.findBy('email', email)

  if (user) return user

  return createUserFromEmail(email)
}
