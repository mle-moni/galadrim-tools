import RestaurantChoice from 'App/Models/RestaurantChoice'

export const getTotalPrice = (choices: RestaurantChoice[]) => {
    return choices.reduce((acc, choice) => {
        return acc + (choice.$extras.average_price || 0)
    }, 0)
}
