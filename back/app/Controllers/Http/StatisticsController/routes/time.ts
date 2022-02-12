import Database from '@ioc:Adonis/Lucid/Database'

export const getTimePerGaladrimeurs = async () => {
    const result = await Database.rawQuery(`
    SELECT
      SEC_TO_TIME (SUM(TIME_TO_SEC(TIMEDIFF(end, start)))) as time,
      users.username,
      users.id 
    FROM events 
    JOIN users ON events.user_id = users.id
    GROUP BY user_id ORDER BY time DESC;`)
    return result[0]
}
