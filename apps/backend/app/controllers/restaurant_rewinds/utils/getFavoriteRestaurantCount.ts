import type RestaurantChoice from "#models/restaurant_choice";

export const getFavoriteRestaurantCount = (choices: RestaurantChoice[]) => {
    const restaurantMap = new Map<number, number>();
    let favoriteRestaurantId = 0;
    let favoriteRestaurantCount = 0;
    choices.forEach((choice) => {
        const current = restaurantMap.get(choice.restaurantId);
        if (!current) {
            restaurantMap.set(choice.restaurantId, 1);
            if (favoriteRestaurantCount === 0) {
                favoriteRestaurantCount = 1;
                favoriteRestaurantId = choice.restaurantId;
            }
        } else {
            restaurantMap.set(choice.restaurantId, current + 1);
            if (current + 1 > favoriteRestaurantCount) {
                favoriteRestaurantCount = current + 1;
                favoriteRestaurantId = choice.restaurantId;
            }
        }
    });
    return { favoriteRestaurantId, favoriteRestaurantCount };
};
