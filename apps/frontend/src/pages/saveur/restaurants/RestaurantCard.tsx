import { type IImage, type IRestaurant, type ITag, NOTES_VALUES } from "@galadrim-tools/shared";
import { Close, Comment, Edit, Favorite, OpenInNewOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Collapse,
    IconButton,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiUrl } from "../../../api/fetch";
import { AppStore } from "../../../globalStores/AppStore";
import { MAX_ZOOM, type SaveurStore } from "../../../globalStores/SaveurStore";
import RatingComponent from "./RatingComponent";
import Ratings from "./Ratings";
import { RestaurantCardStore } from "./RestaurantCardStore";
import { RestaurantReviewsModal } from "./RestaurantReviewsModal";

export const DEFAULT_RESTAURANT_IMAGE_PATH = "/default/restaurant.svg";

export const RestaurantTags = observer<{
    tags: ITag[];
    saveurStore: SaveurStore;
}>(({ tags, saveurStore }) => (
    <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {tags.map(({ id, name }) => (
            <Box
                key={id}
                onClick={() => {
                    saveurStore.restaurantsStore.setSearch(name);
                }}
            >
                <Chip label={name} variant="filled" sx={{ margin: 0.5, cursor: "pointer" }} />
            </Box>
        ))}
    </Box>
));

export const getImageUrl = (image: IImage | null) => {
    if (image === null) {
        return `${getApiUrl()}${DEFAULT_RESTAURANT_IMAGE_PATH}`;
    }
    return `${getApiUrl()}${image.url}`;
};

interface RestaurantCardProps {
    restaurant: IRestaurant;
    saveurStore: SaveurStore;
}

export const RestaurantCard = observer<RestaurantCardProps>(({ restaurant, saveurStore }) => {
    const store = useMemo(() => new RestaurantCardStore(restaurant), [restaurant]);
    const [, setSearchParams] = useSearchParams();

    const choosen = AppStore.authStore.user.dailyChoice === restaurant.id;

    return (
        <Card
            key={restaurant.name}
            sx={{ maxWidth: 400 }}
            style={{ boxShadow: "1px 5px 5px grey" }}
        >
            <CardMedia component="img" height="180" image={getImageUrl(restaurant.image)} />
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                    <Typography sx={{ flex: 1 }} variant="h5" component="div">
                        {restaurant.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        gutterBottom
                        sx={{ fontSize: 16, marginLeft: 2, marginTop: 0.5 }}
                    >
                        {restaurant.averagePrice && `${restaurant.averagePrice}€`}
                    </Typography>
                    {restaurant.websiteLink && (
                        <IconButton
                            LinkComponent={"a"}
                            href={restaurant.websiteLink}
                            target="_blank"
                        >
                            <OpenInNewOutlined />
                        </IconButton>
                    )}
                </Box>
                <RestaurantTags tags={restaurant.tags} saveurStore={saveurStore} />
                <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                </Typography>
                <Ratings ratios={store.ratios} />
            </CardContent>
            <Collapse in={store.isRatingDevelopped}>
                <RatingComponent
                    onClick={(id) => {
                        store.saveRating(id);
                    }}
                />
            </Collapse>
            <CardActions sx={{ display: "flex", justifyContent: "space-around" }}>
                <Button onClick={() => store.toggleIsRatingDevelopped()} size="small">
                    {store.rating ? NOTES_VALUES[store.rating] : <Favorite />}
                </Button>
                <Link to={`/saveur/restaurants/${restaurant.id}`}>
                    <Button size="small">
                        <Edit />
                    </Button>
                </Link>
                <Button
                    size="small"
                    title="Voir les commentaires"
                    onClick={() => {
                        saveurStore.restaurantsStore.reviewsStore.showReviewsForRestaurant(
                            restaurant.id,
                        );
                    }}
                >
                    <Comment />
                    {restaurant.reviews.length === 0 ? null : (
                        <Typography sx={{ ml: 1 }}>{restaurant.reviews.length}</Typography>
                    )}
                </Button>
                <Button
                    size="small"
                    onClick={() => {
                        saveurStore.restaurantsStore.chooseRestaurant(restaurant.id);
                    }}
                    title="Je vais y manger ce midi"
                >
                    <img
                        src={`${getApiUrl()}/maps/i_choose_you.png`}
                        style={{
                            width: 25,
                            height: 25,
                            filter: `grayscale(${choosen ? 0 : 1})`,
                        }}
                    />
                </Button>
                <Button
                    size="small"
                    onClick={() => {
                        setSearchParams(
                            (searchParams) =>
                                new URLSearchParams({
                                    zoom: searchParams.get("zoom") ?? MAX_ZOOM.toString(),
                                }),
                        );
                        saveurStore.restaurantsStore.setRestaurantClicked();
                    }}
                    title="Fermer"
                >
                    <Close />
                </Button>
            </CardActions>
            <RestaurantReviewsModal restaurant={restaurant} saveurStore={saveurStore} />
        </Card>
    );
});
