import type { IRestaurant } from "@galadrim-tools/shared";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { AppStore } from "../../../globalStores/AppStore";
import type { SaveurStore } from "../../../globalStores/SaveurStore";
import { SimpleModalStore } from "../../../reusableComponents/modal/SimpleModalStore";
import { getNameOfUsers } from "./ratingsFunctions";
import { Link } from "react-router-dom";

const topColors = [
    ["#FEE101", "#D6AF36", "black"],
    ["#D7D7D7", "#A7A7AD", "black"],
    ["#A77044", "#824A02", "white"],
];

const getBadgeStyleFromIndex = (index: number) => {
    return index < 3
        ? {
              backgroundColor: topColors[index][0],
              border: `1px solid ${topColors[index][1]}`,
              color: topColors[index][2],
          }
        : {};
};

const RestaurantChoices = observer<{
    restaurant: IRestaurant;
    index: number;
    saveurStore: SaveurStore;
}>(({ restaurant, index, saveurStore }) => {
    const chooseRestaurant = () => {
        saveurStore.restaurantsStore.chooseRestaurant(restaurant.id);
    };

    const choosen = restaurant.choices.includes(AppStore.authStore.user.id);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                gap: 1,
            }}
        >
            <Link
                style={{ color: choosen ? "#4BB543" : "black", textDecoration: "none" }}
                to={`/saveur?zoom=18&restaurant-id=${restaurant.id}`}
            >
                {restaurant.name}
            </Link>
            <Tooltip
                onClick={chooseRestaurant}
                title={getNameOfUsers(restaurant.choices, AppStore.users)}
                placement="bottom-end"
                arrow
                disableInteractive
            >
                <Chip
                    color="secondary"
                    label={restaurant.choices.length}
                    sx={{
                        ...getBadgeStyleFromIndex(index),
                        cursor: "pointer",
                    }}
                />
            </Tooltip>
        </Box>
    );
});

export const UserDailyChoices = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    const restaurants = saveurStore.restaurantsStore.restaurantChoices;
    const store = useMemo(() => new SimpleModalStore(restaurants.length !== 0), [restaurants]);

    return (
        <Box
            sx={{
                zIndex: 6,
                top: 10,
                right: 112,
                position: "absolute",
                backgroundColor: "white",
                userSelect: "none",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    p: 2,
                    backgroundColor: "#4a453d",
                    color: "white",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => store.setModalOpen(!store.modalOpen)}
                >
                    {store.modalOpen ? <ArrowDropUp /> : <ArrowDropDown />}
                    <Typography>Choix du jour des galadrimeurs</Typography>
                </Box>
            </Box>
            {store.modalOpen &&
                (restaurants.length > 0 ? (
                    <Box
                        sx={{
                            maxHeight: "70vh",
                            overflowY: "auto",
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {restaurants.map((restaurant, index) => (
                            <RestaurantChoices
                                restaurant={restaurant}
                                key={restaurant.id}
                                index={index}
                                saveurStore={saveurStore}
                            />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ p: 1 }}>
                        <Typography sx={{ textAlign: "center" }}>
                            Aucun choix pour le moment
                        </Typography>
                    </Box>
                ))}
        </Box>
    );
});
