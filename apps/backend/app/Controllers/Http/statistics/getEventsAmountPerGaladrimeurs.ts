import Database from '@ioc:Adonis/Lucid/Database'

export const getEventsAmountPerGaladrimeurs = async () => {
    const result = await Database.rawQuery(`
    SELECT
      count(events.id) as amount,
      users.username,
      users.id 
    FROM events 
    JOIN users ON events.user_id = users.id
    GROUP BY user_id ORDER BY amount DESC;`)
    return result[0]
}
