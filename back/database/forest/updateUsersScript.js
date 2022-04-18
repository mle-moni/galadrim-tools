require('dotenv').config()
const mysql = require('mysql')

/*
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
*/

const createForestConnection = async () => {
    const connection = mysql.createConnection({
        host: process.env.FOREST_HOST,
        user: process.env.FOREST_USERNAME,
        password: process.env.FOREST_PASSWORD,
        database: process.env.FOREST_DB,
    })

    return new Promise((resolve, reject) => {
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

const getForestUsers = async () => {
    const forestConnection = await createForestConnection()

    const users = await new Promise((resolve, reject) => {
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

const getImageUrl = (id) => {
    return `https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/${id}.jpg`
}

const createMysqlConnection = async () => {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB_NAME,
    })

    return new Promise((resolve, reject) => {
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

const updateUserWithForestInfos = async (connection, forestUser, userId) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'UPDATE users SET email = ?, image_url = ? WHERE id = ?',
            [forestUser.Email, getImageUrl(forestUser.UserId), userId],
            (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            }
        )
    })
}

const getForestUsersMap = async () => {
    return new Map((await getForestUsers()).map((user) => [user.Username, user]))
}

const getLocalUsers = async (connection) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users', function (error, results, _fieldsInfos) {
            if (error) reject(error)
            resolve(results)
        })
    })
}

const startScript = async () => {
    const connection = await createMysqlConnection()
    const users = await getLocalUsers(connection)
    const forestUsers = users.length > 0 ? await getForestUsersMap() : new Map()

    for (const user of users) {
        const forestUser = forestUsers.get(user.username)
        if (forestUser) {
            await updateUserWithForestInfos(connection, forestUser, user.id)
        }
    }

    connection.end()
}

startScript()
