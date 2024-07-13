import env from '#start/env'
import { MailConfig } from "@adonisjs/mail";

const mailConfig: MailConfig = {
    /*
  |--------------------------------------------------------------------------
  | Default mailer
  |--------------------------------------------------------------------------
  |
  | The following mailer will be used to send emails, when you don't specify
  | a mailer
  |
  */
    mailer: 'mailgun',

    /*
  |--------------------------------------------------------------------------
  | Mailers
  |--------------------------------------------------------------------------
  |
  | You can define or more mailers to send emails from your application. A
  | single `driver` can be used to define multiple mailers with different
  | config.
  |
  | For example: Postmark driver can be used to have different mailers for
  | sending transactional and promotional emails
  |
  */
    mailers: {
        /*
    |--------------------------------------------------------------------------
    | Mailgun
    |--------------------------------------------------------------------------
    |
		| Uses Mailgun service for sending emails.
    |
    | If you are using an EU domain. Ensure to change the baseUrl to hit the
    | europe endpoint (https://api.eu.mailgun.net/v3).
    |
    */
        mailgun: {
            driver: 'mailgun',
            baseUrl: 'https://api.eu.mailgun.net/v3',
            key: env.get('MAILGUN_API_KEY'),
            domain: env.get('MAILGUN_DOMAIN'),
        },
    },
}

export default mailConfig
