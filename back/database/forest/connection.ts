import Env from '@ioc:Adonis/Core/Env'
import mysql from 'mysql'

export const ForestConnection = mysql.createConnection({
    host: Env.get('FOREST_HOST'),
    user: Env.get('FOREST_USERNAME'),
    password: Env.get('FOREST_PASSWORD'),
    database: Env.get('FOREST_DB'),
})
