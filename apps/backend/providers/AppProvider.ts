import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { CamelCaseNamingStrategy } from '../contracts/CamelCaseNamingStrategy'

export default class AppProvider {
    constructor(protected app: ApplicationContract) {}

    public register() {
        // Register your own bindings
    }

    public async boot() {
        // IoC container is ready

        const { BaseModel } = await import('@ioc:Adonis/Lucid/Orm')
        BaseModel.namingStrategy = new CamelCaseNamingStrategy()
    }

    public async ready() {
        // App is ready
        if (this.app.environment === 'web') {
            await import('../start/socket')
        }
    }

    public async shutdown() {
        // Cleanup, since app is going down
    }
}
