import Database from '@ioc:Adonis/Lucid/Database'

export const getGaladrimeurFavoriteRooms = async () => {
    const result = await Database.rawQuery(`
    SELECT
      room as id,
      room, 
      SEC_TO_TIME (SUM(TIME_TO_SEC(TIMEDIFF(end, start)))) as time,
      count(events.id) as amount 
    FROM events 
    GROUP BY room ORDER BY time DESC;`)
    return result[0]
}
