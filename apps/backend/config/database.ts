/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import env from '#start/env'
import { DatabaseConfig } from "@adonisjs/lucid/database";

const databaseConfig: DatabaseConfig = {
    /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
    connection: env.get('DB_CONNECTION'),

    connections: {
        /*
    |--------------------------------------------------------------------------
    | MySQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for MySQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i mysql
    |
    */
        mysql: {
            client: 'mysql',
            connection: {
                host: env.get('MYSQL_HOST'),
                port: env.get('MYSQL_PORT'),
                user: env.get('MYSQL_USER'),
                password: env.get('MYSQL_PASSWORD', ''),
                database: env.get('MYSQL_DB_NAME'),
                charset: 'utf8mb4',
            },
            migrations: {
                naturalSort: true,
            },
            healthCheck: false,
            debug: false,
        },
    },
}

export default databaseConfig
