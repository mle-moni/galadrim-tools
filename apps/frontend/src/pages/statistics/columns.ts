import { GridColumns, GridComparatorFn } from '@mui/x-data-grid'

const timeComparator: GridComparatorFn = (v1, v2) => {
    const [hour1, minute1, second1] = v1!.toString().split(':')
    const [hour2, minute2, second2] = v2!.toString().split(':')
    const date1 = new Date(0, 0, 0, +hour1, +minute1, +second1)
    const date2 = new Date(0, 0, 0, +hour2, +minute2, +second2)
    return date1.getTime() - date2.getTime()
}

const username = {
    field: 'username',
    headerName: 'Galadrimeur',
    width: 200,
}
const time = {
    field: 'time',
    headerName: 'Temps passé dans les salles',
    width: 200,
    sortComparator: timeComparator,
    sortingOrder: ['desc', 'asc'],
}
const amount = { field: 'amount', headerName: 'Nombre de réservations', width: 200 }
const room = {
    field: 'room',
    headerName: 'Salle',
    width: 200,
}

export const timeColumns: GridColumns = [username, time]

export const amountColumns: GridColumns = [username, amount]

export const roomColumns: GridColumns = [room, amount, time]
