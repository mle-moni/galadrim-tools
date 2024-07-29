import RestaurantChoice from '#models/restaurant_choice'

export const getTotalPrice = (choices: RestaurantChoice[]) => {
  return choices.reduce((acc, choice) => {
    return acc + (choice.$extras.average_price || 0)
  }, 0)
}
