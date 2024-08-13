import { Home } from "@mui/icons-material";
import { Box, List, ListItemText, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { AppStore } from "../../../globalStores/AppStore";
import { RewindStore } from "../../../globalStores/RewindStore";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { CustomLink } from "../../../reusableComponents/Core/CustomLink";
import WithRibbons from "../../../reusableComponents/animations/rewind/WithRibbons";
import { RewindRoot } from "./RewindPage";

const RewindRecapPage = observer(() => {
    const userRewindStore = useMemo(() => {
        const rewindStore = new RewindStore();
        rewindStore.fetch();
        return rewindStore;
    }, []);

    const restaurantsStore = AppStore.saveurStore.restaurantsStore;

    const favoriteRestaurant = restaurantsStore.restaurants.find(
        (restaurant) => restaurant.id === userRewindStore.rewind?.favoriteRestaurantId,
    );

    const isMobile = useIsMobile();

    return (
        <RewindRoot fullscreen>
            <CustomLink to="/saveur" style={{ position: "absolute", left: 10, top: 10, zIndex: 6 }}>
                <Home />
            </CustomLink>
            <WithRibbons>
                <Box
                    display={"flex"}
                    flexDirection={isMobile ? "column" : "row"}
                    gap={8}
                    sx={{
                        backgroundColor: "#F0FFF199",
                        padding: "16px",
                        overflowY: "scroll",
                        maxHeight: "100vh",
                    }}
                >
                    <Stack display={"flex"} alignItems={"center"}>
                        <h2>{userRewindStore.rewindPersonalityString}</h2>
                        <img
                            src={`/assets/images/rewind/${userRewindStore.rewindImageName}`}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                width: 600,
                                height: 600,
                            }}
                        />
                    </Stack>
                    <Stack
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                        sx={{ color: "#8367c7" }}
                        gap={4}
                    >
                        <List>
                            <ListItemText>
                                • Vous avez mangé{" "}
                                <strong>
                                    {userRewindStore.rewind?.dailyChoiceCount || 0} fois
                                </strong>{" "}
                                au restaurant
                            </ListItemText>
                            <ListItemText>
                                • Vous avez dépensé en moyenne{" "}
                                <strong>{userRewindStore.rewind?.averagePrice || 0} €</strong> pour
                                un total de{" "}
                                <strong>{userRewindStore.rewind?.totalPrice || 0} €</strong>
                            </ListItemText>
                            <ListItemText>
                                • Vous avez parcouru en moyenne{" "}
                                <strong>
                                    {userRewindStore.rewind?.averageDistanceTravelled || 0} m
                                </strong>{" "}
                                pour un total de{" "}
                                <strong>
                                    {userRewindStore.rewind?.totalDistanceTravelled
                                        ? userRewindStore.rewind.totalDistanceTravelled / 1000
                                        : 0}{" "}
                                    km
                                </strong>
                            </ListItemText>
                        </List>
                        <List>
                            {(userRewindStore.threeBestCategories || []).map(([label, count]) => (
                                // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                                <ListItemText>
                                    • Vous avez mangé <strong>{count} fois</strong> au restaurant
                                    dans la catégorie <strong>{label}</strong>
                                </ListItemText>
                            ))}
                        </List>
                        {favoriteRestaurant && (
                            <Typography typography={"body1"}>
                                • Vous avez mangé{" "}
                                <strong>
                                    {userRewindStore.rewind?.favoriteRestaurantCount} fois
                                </strong>{" "}
                                chez <strong>{favoriteRestaurant.name}</strong>
                            </Typography>
                        )}
                    </Stack>
                </Box>
            </WithRibbons>
        </RewindRoot>
    );
});

export default RewindRecapPage;
