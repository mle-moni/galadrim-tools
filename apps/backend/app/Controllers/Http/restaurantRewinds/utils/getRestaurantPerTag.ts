import RestaurantChoice from 'App/Models/RestaurantChoice'

export const getRestaurantPerTag = (choices: RestaurantChoice[]) => {
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
