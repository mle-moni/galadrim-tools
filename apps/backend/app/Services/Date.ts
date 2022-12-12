export const formatDateToNumber = (date: Date) => {
    const year = date.getFullYear()
    const month = `0${date.getMonth() + 1}`
    const day = `0${date.getDate()}`
    return parseInt(`${year}${month.substring(month.length - 2)}${day.substring(day.length - 2)}`)
}
