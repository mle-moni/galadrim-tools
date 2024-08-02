import env from "#start/env";
import { defineConfig, transports } from "@adonisjs/mail";

const mailConfig = defineConfig({
    default: "mailgun",

    /**
     * The mailers object can be used to configure multiple mailers
     * each using a different transport or same transport with different
     * options.
     */
    mailers: {
        mailgun: transports.mailgun({
            baseUrl: "https://api.eu.mailgun.net/v3",
            key: env.get("MAILGUN_API_KEY"),
            domain: env.get("MAILGUN_DOMAIN"),
        }),
    },
});

export default mailConfig;

declare module "@adonisjs/mail/types" {
    export interface MailersList extends InferMailers<typeof mailConfig> {}
}
