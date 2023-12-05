import RestaurantChoice from 'App/Models/RestaurantChoice'
import RestaurantNote from 'App/Models/RestaurantNote'
import { NANTES_COORDINATES_VALUES, PARIS_COORDINATES_VALUES } from '@galadrim-tools/shared'

const getFavoriteRestaurantCount = (choices: RestaurantChoice[]) => {
    const restaurantMap = new Map<number, number>()
    let favoriteRestaurantId = 0
    let favoriteRestaurantCount = 0
    choices.forEach((choice) => {
        const current = restaurantMap.get(choice.restaurantId)
        if (!current) {
            restaurantMap.set(choice.restaurantId, 1)
            if (favoriteRestaurantCount === 0) {
                favoriteRestaurantCount = 1
                favoriteRestaurantId = choice.restaurantId
            }
        } else {
            restaurantMap.set(choice.restaurantId, current + 1)
            if (current + 1 > favoriteRestaurantCount) {
                favoriteRestaurantCount = current + 1
                favoriteRestaurantId = choice.restaurantId
            }
        }
    })
    return { favoriteRestaurantId, favoriteRestaurantCount }
}

const getRestaurantPerTag = (choices: RestaurantChoice[]) => {
    const restaurantTagMap = new Map<string, number>()
    choices.forEach((choice) => {
        const tagNames: string[] = JSON.parse(choice.$extras.tagNames) ?? []
        tagNames.forEach((tagName) => {
            const current = restaurantTagMap.get(tagName)
            if (!current) {
                restaurantTagMap.set(tagName, 1)
            } else {
                restaurantTagMap.set(tagName, current + 1)
            }
        })
    })
    return Object.fromEntries(restaurantTagMap)
}

const toRadians = (degrees: number) => {
    return (degrees * Math.PI) / 180
}

const distanceBetweenCoordinates = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3 // meters
    const phi1 = toRadians(lat1)
    const phi2 = toRadians(lat2)
    const deltaPhi = toRadians(lat2 - lat1)
    const deltaLambda = toRadians(lng2 - lng1)

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

const getDistanceTravelled = (choices: RestaurantChoice[]) => {
    const totalDistance = Math.round(
        choices.reduce((acc, choice) => {
            const [lat, lng] = [choice.$extras.lat, choice.$extras.lng]
            const distanceParis = distanceBetweenCoordinates(...PARIS_COORDINATES_VALUES, lat, lng)
            if (distanceParis > 10000) {
                return acc + distanceBetweenCoordinates(...NANTES_COORDINATES_VALUES, lat, lng)
            }
            return acc + distanceParis
        }, 0)
    )
    return 2 * totalDistance // aller-retour
}

const getTotalPrice = (choices: RestaurantChoice[]) => {
    return choices.reduce((acc, choice) => {
        return acc + (choice.$extras.average_price || 0)
    }, 0)
}

export const generateRewindForUser = async (userId: number) => {
    const choices = await RestaurantChoice.query()
        .leftJoin('restaurants', 'restaurant_choices.restaurant_id', 'restaurants.id')
        .as('restaurant')
        .joinRaw(
            'LEFT JOIN LATERAL (SELECT json_arrayagg(tags.name) as tagNames FROM restaurant_tag LEFT JOIN tags ON restaurant_tag.tag_id = tags.id WHERE restaurant_tag.restaurant_id = restaurants.id ORDER BY restaurant_tag.id DESC) AS restaurant_tag ON true'
        )
        .where('restaurant_choices.user_id', userId)

    const dailyChoiceCount = choices.length

    const favoriteRestaurantCount = getFavoriteRestaurantCount(choices)
    const restaurantsPerTags = getRestaurantPerTag(choices)
    const totalDistanceTravelled = getDistanceTravelled(choices)
    const averageDistanceTravelled = Math.round(totalDistanceTravelled / dailyChoiceCount)
    const totalPrice = getTotalPrice(choices)
    const averagePrice = +(totalPrice / dailyChoiceCount).toFixed(2)

    const restaurantNotes = await RestaurantNote.query().where('user_id', userId)

    const restaurantAverageScore = +(
        restaurantNotes.reduce((acc, note) => acc + +note.note, 0) / restaurantNotes.length
    ).toFixed(1)

    return {
        message: 'Rewind ajouté',
        dailyChoiceCount,
        favoriteRestaurantCount,
        restaurantsPerTags,
        restaurantAverageScore,
        totalDistanceTravelled,
        averageDistanceTravelled,
        totalPrice,
        averagePrice,
    }
}
