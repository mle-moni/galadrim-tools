import getPort from 'get-port'
import { configure } from 'japa'
import { join } from 'path'
import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'

const PROJECT_HOME = __dirname + '/..'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(PROJECT_HOME)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function startHttpServer() {
    const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
    process.env.PORT = String(await getPort())
    await new Ignitor(PROJECT_HOME).httpServer().start()
}

/**
 * Configure test runner
 */
configure({
    files: ['*/**/*.spec.ts'],
    before: [startHttpServer],
})
