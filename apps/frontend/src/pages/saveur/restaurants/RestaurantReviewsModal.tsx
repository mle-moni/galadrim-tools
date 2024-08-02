import type { IRestaurant, IReview } from "@galadrim-tools/shared";
import { Send } from "@mui/icons-material";
import { Box, Button, OutlinedInput, Tooltip, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { AppStore } from "../../../globalStores/AppStore";
import type { SaveurStore } from "../../../globalStores/SaveurStore";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { SimpleModal } from "../../../reusableComponents/modal/SimpleModal";
import { getHumanFormattedDate, getHumanFormattedTimeDifference } from "../../idea/ideasUtils";
import { getImageUrl } from "./RestaurantCard";

interface RestaurantReviewsModalProps {
    restaurant: IRestaurant;
    saveurStore: SaveurStore;
}

const ReviewDiv = observer<{
    review: IReview;
}>(({ review }) => {
    const { users } = AppStore;
    const user = users.get(review.userId);
    const isSelf = review.userId === AppStore.authStore.user.id;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSelf ? "flex-end" : "flex-start",
                paddingBottom: 1,
                my: 4,
            }}
        >
            {user && (
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                    <img
                        src={user.imageUrl ?? undefined}
                        width="50px"
                        height="50px"
                        style={{ borderRadius: 1000, marginRight: 10 }}
                    />
                    <Typography sx={{ color: "gray", mr: 1 }}>{user.username}</Typography>
                    <Tooltip title={getHumanFormattedDate(review.createdAt)} placement="top">
                        <Typography sx={{ color: "gray" }}>
                            ( {getHumanFormattedTimeDifference(review.createdAt)} )
                        </Typography>
                    </Tooltip>
                </Box>
            )}
            <Typography
                sx={{
                    paddingX: 2,
                    paddingY: 1,
                    backgroundColor: isSelf ? "lightgray" : "white",
                    borderRadius: 5,
                    textAlign: isSelf ? "end" : "start",
                    width: "fit-content",
                    border: "1px solid #CECECE",
                    whiteSpace: "break-spaces",
                    mb: 1,
                }}
            >
                {review.comment}
            </Typography>
            {review.image !== null && (
                <img
                    title={`${user?.username} : ${review.comment}`}
                    src={getImageUrl(review.image)}
                    alt="review"
                    style={{ borderRadius: "4px", maxWidth: "80%", maxHeight: "300px" }}
                />
            )}
        </Box>
    );
});

export const RestaurantReviewsModal = observer<RestaurantReviewsModalProps>(
    ({ restaurant, saveurStore }) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const scrollCommentsRef = useRef<any>();
        const isMobile = useIsMobile();

        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        useEffect(() => {
            setTimeout(() => {
                scrollCommentsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }, [restaurant.reviews.length]);

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            saveurStore.restaurantsStore.reviewsStore.addReview();
        };

        return (
            <SimpleModal
                width={"80%"}
                open={saveurStore.restaurantsStore.reviewsStore.restaurantId !== null}
                onClose={() =>
                    saveurStore.restaurantsStore.reviewsStore.showReviewsForRestaurant(null)
                }
            >
                <Typography sx={{ fontSize: 22, textAlign: "center" }}>
                    Avis pour <b>{restaurant.name}</b>
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
                        {restaurant.reviews.map((review) => {
                            return <ReviewDiv review={review} key={review.id} />;
                        })}
                        <Box key={"bottomRef"} ref={scrollCommentsRef} />
                    </Box>
                    <Box
                        style={{
                            display: "flex",
                            flex: 1,
                            alignItems: "center",
                        }}
                        sx={{ marginTop: ["6px", "15px"] }}
                    >
                        <OutlinedInput
                            value={saveurStore.restaurantsStore.reviewsStore.comment.text}
                            onChange={(e) =>
                                saveurStore.restaurantsStore.reviewsStore.comment.setText(
                                    e.target.value,
                                )
                            }
                            placeholder={`Exprimez-vous sur ${restaurant.name}...`}
                            sx={{ flex: 1, marginRight: [1, 2] }}
                            multiline
                        />
                        <Box sx={{ my: 2 }}>
                            <Button variant="contained" component="label" sx={{ my: 2 }}>
                                Ajouter une image
                                <input
                                    key={saveurStore.restaurantsStore.reviewsStore.loadingStore.isLoading.toString()}
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    id="image"
                                    multiple
                                    onChange={(e) =>
                                        saveurStore.restaurantsStore.reviewsStore.imageStore.setUploadedImage(
                                            e.target,
                                        )
                                    }
                                />
                            </Button>
                            {saveurStore.restaurantsStore.reviewsStore.imageStore.image !==
                                null && (
                                <span style={{ marginLeft: "12px" }}>
                                    (
                                    {
                                        saveurStore.restaurantsStore.reviewsStore.imageStore.image
                                            .name
                                    }
                                    )
                                </span>
                            )}
                        </Box>
                        <Button
                            disabled={saveurStore.restaurantsStore.reviewsStore.submitDisabled}
                            type="submit"
                        >
                            <Send fontSize={isMobile ? "medium" : "large"} />
                        </Button>
                    </Box>
                </form>
            </SimpleModal>
        );
    },
);
