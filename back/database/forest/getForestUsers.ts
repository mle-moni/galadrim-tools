import Env from '@ioc:Adonis/Core/Env'
import mysql from 'mysql'

export interface ForestUser {
    UserId: number
    Username: string
    Password: string
    AceTheme: string
    Email: string
    FullName: string
    IsTechnical: number
    IsFreelance: number
    IsGuest: number
    IsAdmin: number
    IsBusiness: number
    IsAccountant: number
    IsBookable: number
    IsFake: number
    IsArchitect: number
    IsDeactivated: number
    WillLeave: number
    ShouldConfirmBeforePutIntoProduction: number
    SlackUsername: string
    MysqlUsername: string
    MysqlPassword: string
    ShowTabsTooltips: number
    MaxTabs: number
    LastSurveyDatetime: string
    PlanningIndex: number
}

export const createForestConnection = async () => {
    const connection = mysql.createConnection({
        host: Env.get('FOREST_HOST'),
        user: Env.get('FOREST_USERNAME'),
        password: Env.get('FOREST_PASSWORD'),
        database: Env.get('FOREST_DB'),
    })

    return new Promise<mysql.Connection>((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                console.error('could not connect to FOREST database')
                reject(err)
            } else {
                resolve(connection)
            }
        })
    })
}

export const getForestUsers = async (): Promise<ForestUser[]> => {
    const forestConnection = await createForestConnection()

    const users: ForestUser[] = await new Promise((resolve, reject) => {
        forestConnection.query(
            'SELECT * FROM Users WHERE IsFake = FALSE AND IsDeactivated = FALSE AND IsGuest = FALSE;',
            function (error, results, _fieldsInfos) {
                if (error) reject(error)
                resolve(results)
            }
        )
    })

    forestConnection.end()
    return users
}
