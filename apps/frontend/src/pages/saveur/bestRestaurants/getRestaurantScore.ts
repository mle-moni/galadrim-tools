import { INotes, IRestaurant } from '@galadrim-tools/shared'

// ? https://stringfixer.com/fr/Bayesian_estimator
const WEIGHT = 4

const getAverage = (list: number[]) => {
    if (list.length === 0) {
        return 0
    }

    return list.reduce((acc, curr) => acc + curr, 0) / list.length
}

const getNotesAverage = (notes: INotes[]) => {
    return getAverage(notes.map(({ note }) => parseInt(note)))
}

const getRestaurantScore = (
    {
        average,
        restaurant,
    }: {
        restaurant: IRestaurant
        average: number
    },
    allRestaurantsNotesAverage: number
) => {
    const numberOfVotes = restaurant.notes.length
    const dividende = average * numberOfVotes + allRestaurantsNotesAverage * WEIGHT
    const diviseur = numberOfVotes + WEIGHT

    return dividende / diviseur
}

export const getRestaurantsScore = (restaurants: IRestaurant[]) => {
    const restaurantAverages = restaurants.map((restaurant) => ({
        restaurantId: restaurant.id,
        restaurant,
        average: getNotesAverage(restaurant.notes),
    }))
    const averages = restaurantAverages.map(({ average }) => average)

    const allRestaurantsNotesAverage = getAverage(averages)

    const scores = restaurantAverages.map(({ average, restaurant, restaurantId }) => ({
        restaurantId,
        restaurant,
        score: getRestaurantScore({ average, restaurant }, allRestaurantsNotesAverage),
    }))

    return scores
}