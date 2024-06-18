import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createReadStream, statSync } from 'node:fs'

export const showAtopLogs = async ({ params, response }: HttpContextContract) => {
    const directory = Application.tmpPath('uploads/atop')
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
