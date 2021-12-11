import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { ForestConnection } from 'Database/forest/connection'

export default class AppProvider {
    constructor(protected app: ApplicationContract) {}

    public register() {
        // Register your own bindings
    }

    public async boot() {
        // IoC container is ready
        ForestConnection.connect()
    }

    public async ready() {
        // App is ready
        if (this.app.environment === 'web') {
            await import('../start/socket')
        }
    }

    public async shutdown() {
        // Cleanup, since app is going down
        ForestConnection.end()
    }
}
