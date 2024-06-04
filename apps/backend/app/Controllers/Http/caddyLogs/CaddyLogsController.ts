import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { randomBytes } from 'node:crypto'
import { createReadStream, readFileSync, statSync, writeFileSync } from 'node:fs'

const fileValidation = schema.create({
    file: schema.file({ size: '5mb' }),
})

export default class CaddyLogsController {
    public async show({ response, params }: HttpContextContract) {
        const directory = Application.tmpPath('uploads/caddy')
        const filePath = `${directory}/${params.id}`

        try {
            statSync(filePath) // check if file exists, throw if not

            const readStream = createReadStream(filePath)

            response.type('application/json')

            return response.stream(readStream)
        } catch (error) {
            return response.notFound({ error: 'log file not found' })
        }
    }

    public async store({ request, response }: HttpContextContract) {
        const { file } = await request.validate({ schema: fileValidation })
        const generatedFileName = randomBytes(32).toString('base64url')
        const directory = Application.tmpPath('uploads/caddy')

        await file.move(directory, {
            name: generatedFileName,
            overwrite: true,
        })

        const filePath = `${directory}/${generatedFileName}`
        const data = readFileSync(filePath)
        const json = `[ ${data.toString().split('\n').join(',\n').slice(0, -2)} ]`

        writeFileSync(filePath, json)

        const frontendUrl = Env.get('FRONTEND_URL')
        const finalUrl = new URL(`/caddyLogs/${generatedFileName}`, frontendUrl).toString()

        return response.created({ url: finalUrl })
    }
}
