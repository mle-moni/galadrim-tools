import { observer } from "mobx-react-lite";
import type { SaveurStore } from "../../../globalStores/SaveurStore";
import { RestaurantCard } from "./RestaurantCard";

export const RestaurantDisplay = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    if (saveurStore.restaurantsStore.restaurantClicked === undefined) {
        return null;
    }

    return (
        <RestaurantCard
            restaurant={saveurStore.restaurantsStore.restaurantClicked}
            saveurStore={saveurStore}
        />
    );
});
