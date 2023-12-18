import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class GenerateRewind extends BaseCommand {
    /**
     * Command name is used to run the command
     */
    public static commandName = 'generate:rewind'

    /**
     * Command description is displayed in the "help" output
     */
    public static description = 'Generate rewinds for all users'

    public static settings = {
        /**
         * Set the following value to true, if you want to load the application
         * before running the command. Don't forget to call `node ace generate:manifest`
         * afterwards.
         */
        loadApp: true,

        /**
         * Set the following value to true, if you want this command to keep running until
         * you manually decide to exit the process. Don't forget to call
         * `node ace generate:manifest` afterwards.
         */
        stayAlive: false,
    }

    public async run() {
        this.logger.info('Generating rewinds...')
        const { generateRewind } = await import(
            'App/Controllers/Http/restaurantRewinds/generateRewind'
        )
        await generateRewind()
        this.logger.info('Done!')
    }
}
