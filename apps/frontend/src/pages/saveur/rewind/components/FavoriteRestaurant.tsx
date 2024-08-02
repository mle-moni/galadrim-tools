import { Box } from "@mui/material";
import { AppStore } from "../../../../globalStores/AppStore";
import CountUp from "react-countup";

type FavoriteRestaurantProps = {
    favoriteRestaurantId?: number | null;
    favoriteRestaurantCount?: number | null;
};

export const FavoriteRestaurant = ({
    favoriteRestaurantId,
    favoriteRestaurantCount,
}: FavoriteRestaurantProps) => {
    const restaurantsStore = AppStore.saveurStore.restaurantsStore;

    const favoriteRestaurant = restaurantsStore.restaurants.find(
        (restaurant) => restaurant.id === favoriteRestaurantId,
    );

    if (!favoriteRestaurant || !favoriteRestaurantCount) {
        return <h2>Bah nan t'as rien rempli</h2>;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
            }}
        >
            <h1>{favoriteRestaurant?.name}</h1>
            <h3
                style={{
                    color: "#8367C7",
                    fontWeight: 600,
                    fontSize: 24,
                }}
            >
                Vous y êtes allés{" "}
                <span style={{ fontWeight: 800 }}>
                    <CountUp end={favoriteRestaurantCount} start={0} duration={5} />
                </span>{" "}
                fois
            </h3>
        </Box>
    );
};
