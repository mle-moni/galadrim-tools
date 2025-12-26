import { useEffect } from "react";
import { io } from "socket.io-client";

import type { IRestaurant, IReview, ITag, IUserData } from "@galadrim-tools/shared";
import { useQueryClient } from "@tanstack/react-query";

import { getSocketApiUrl } from "@/integrations/backend/client";
import { queryKeys } from "@/integrations/backend/query-keys";

function parseId(payload: unknown): number | null {
    if (typeof payload === "number") {
        return Number.isFinite(payload) ? payload : null;
    }

    if (typeof payload === "string") {
        const trimmed = payload.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }

    if (payload && typeof payload === "object" && "id" in payload) {
        const maybeId = (payload as { id?: unknown }).id;
        return parseId(maybeId);
    }

    return null;
}

function upsertRestaurantInList(restaurants: IRestaurant[], restaurant: IRestaurant) {
    const existingIndex = restaurants.findIndex((r) => r.id === restaurant.id);
    if (existingIndex === -1) return [restaurant, ...restaurants];

    const next = restaurants.slice();
    next[existingIndex] = restaurant;
    return next;
}

function removeRestaurantFromList(restaurants: IRestaurant[], restaurantId: number) {
    return restaurants.filter((r) => r.id !== restaurantId);
}

function upsertReviewInRestaurant(restaurant: IRestaurant, review: IReview) {
    const nextReviews = [review, ...restaurant.reviews.filter((r) => r.id !== review.id)];
    return { ...restaurant, reviews: nextReviews };
}

function removeReviewFromRestaurant(restaurant: IRestaurant, reviewId: number) {
    const nextReviews = restaurant.reviews.filter((r) => r.id !== reviewId);
    return { ...restaurant, reviews: nextReviews };
}

function upsertTagInList(tags: ITag[], tag: ITag) {
    const existingIndex = tags.findIndex((t) => t.id === tag.id);
    if (existingIndex === -1) return [tag, ...tags];

    const next = tags.slice();
    next[existingIndex] = tag;
    return next;
}

function removeTagFromList(tags: ITag[], tagId: number) {
    return tags.filter((t) => t.id !== tagId);
}

export function useMiamsSocketSync(me: IUserData | undefined) {
    const queryClient = useQueryClient();

    const socketUserId = me?.id;
    const socketToken = me?.socketToken;

    useEffect(() => {
        if (socketUserId == null) return;
        if (!socketToken) return;

        const socket = io(getSocketApiUrl(), { transports: ["websocket"] });

        const authenticate = () => {
            socket.emit("auth", {
                userId: socketUserId,
                socketToken,
            });
        };

        socket.on("connect", authenticate);
        socket.on("auth", authenticate);

        socket.on("createRestaurant", (restaurant: IRestaurant) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return [restaurant];
                return upsertRestaurantInList(old, restaurant);
            });
        });

        socket.on("updateRestaurant", (restaurant: IRestaurant) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return [restaurant];
                return upsertRestaurantInList(old, restaurant);
            });
        });

        socket.on("deleteRestaurant", (payload: unknown) => {
            const restaurantId = parseId(payload);
            if (restaurantId == null) return;

            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;
                return removeRestaurantFromList(old, restaurantId);
            });
        });

        socket.on("createTag", (tag: ITag) => {
            queryClient.setQueryData<ITag[]>(queryKeys.tags(), (old) => {
                if (!old) return [tag];
                return upsertTagInList(old, tag);
            });
        });

        socket.on("updateTag", (tag: ITag) => {
            queryClient.setQueryData<ITag[]>(queryKeys.tags(), (old) => {
                if (!old) return [tag];
                return upsertTagInList(old, tag);
            });
        });

        socket.on("deleteTag", (payload: unknown) => {
            const tagId = parseId(payload);
            if (tagId == null) return;

            queryClient.setQueryData<ITag[]>(queryKeys.tags(), (old) => {
                if (!old) return old;
                return removeTagFromList(old, tagId);
            });
        });

        socket.on("createRestaurantReview", (review: IReview) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((r) => {
                    if (r.id !== review.restaurantId) return r;
                    return upsertReviewInRestaurant(r, review);
                });
            });
        });

        socket.on("updateRestaurantReview", (review: IReview) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((r) => {
                    if (r.id !== review.restaurantId) return r;
                    return upsertReviewInRestaurant(r, review);
                });
            });
        });

        socket.on("deleteRestaurantReview", (reviewId: unknown) => {
            const deletedId = parseId(reviewId);
            if (deletedId == null) return;

            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((r) => {
                    if (!r.reviews.some((rev) => rev.id === deletedId)) return r;
                    return removeReviewFromRestaurant(r, deletedId);
                });
            });
        });

        socket.on("chooseRestaurant", (restaurant: IRestaurant) => {
            queryClient.setQueryData<IUserData>(queryKeys.me(), (old) => {
                if (!old) return old;
                return { ...old, dailyChoice: restaurant.id };
            });

            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return [restaurant];
                return upsertRestaurantInList(old, restaurant);
            });
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [queryClient, socketToken, socketUserId]);
}
