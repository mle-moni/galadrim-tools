import { useMemo } from "react";
import { AppStore } from "../../../../globalStores/AppStore";
import type { RewindStore } from "../../../../globalStores/RewindStore";
import { TimerSlides } from "../../../../reusableComponents/common/TimerSlides";
import { FavoriteRestaurant } from "../components/FavoriteRestaurant";
import { TextCard } from "../components/TextCard";

type FifthSlideProps = {
    rewindStore: RewindStore;
};

export const FifthSlide = ({ rewindStore }: FifthSlideProps) => {
    const restaurantsStore = AppStore.saveurStore.restaurantsStore;

    const favoriteRestaurant = restaurantsStore.restaurants.find(
        (restaurant) => restaurant.id === rewindStore.rewind?.favoriteRestaurantId,
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const childrens = useMemo(
        () => [
            {
                component: (
                    <TextCard>
                        <h2>Et parmi tous ces choix, un restaurant se démarque</h2>
                    </TextCard>
                ),
                duration: 4000,
            },
            {
                component: (
                    <FavoriteRestaurant
                        favoriteRestaurantId={favoriteRestaurant?.id}
                        favoriteRestaurantCount={rewindStore.rewind?.favoriteRestaurantCount}
                    />
                ),
                duration: 6000,
            },
        ],
        [rewindStore.loadingState.isLoading, favoriteRestaurant?.id],
    );

    return <TimerSlides slides={childrens} isSubSlide />;
};
