import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const fileValidation = schema.create({
    file: schema.file({ size: '100mb' }),
})

export const storeAtopLogs = async ({ request, response }: HttpContextContract) => {
    const { file } = await request.validate({ schema: fileValidation })
    const generatedFileName = randomBytes(32).toString('base64url')
    const directory = Application.tmpPath('uploads/atop')

    await file.move(directory, {
        name: generatedFileName,
        overwrite: true,
    })

    const filePath = `${directory}/${generatedFileName}`
    const data = readFileSync(filePath)
    const json = `[ ${data.toString().split('\n').join(',\n').slice(0, -2)} ]`

    writeFileSync(filePath, json)

    const frontendUrl = Env.get('FRONTEND_URL')
    const finalUrl = new URL(`/atopLogs/${generatedFileName}`, frontendUrl).toString()

    return response.created(`\n${finalUrl}\n`)
}
