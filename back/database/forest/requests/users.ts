import { ForestConnection } from '../connection'

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

export const getForestUsers = (): Promise<ForestUser[]> => {
    return new Promise((resolve, reject) => {
        ForestConnection.query(
            'SELECT * FROM Users WHERE IsFake = FALSE AND IsDeactivated = FALSE AND IsGuest = FALSE;',
            function (error, results, _fieldsInfos) {
                if (error) reject(error)
                resolve(results)
            }
        )
    })
}

export const findForestUser = (username: string, password: string): Promise<ForestUser | null> => {
    return new Promise((resolve, reject) => {
        ForestConnection.query(
            `SELECT * FROM Users WHERE Username = ? AND Password = ?;`,
            [username, password],
            function (error, results, _fieldsInfos) {
                if (error) reject(error)
                if (results.length === 0) {
                    resolve(null)
                    return
                }
                resolve(results[0])
            }
        )
    })
}
