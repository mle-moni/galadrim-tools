import type {
    ApiError,
    INotes,
    IRestaurant,
    IReview,
    ITag,
    IUserData,
    NotesOption,
} from "@galadrim-tools/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

export async function fetchRestaurants(): Promise<IRestaurant[]> {
    const res = await fetchBackendJson<IRestaurant[], ApiError>("/restaurants", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les restaurants"));
    }

    return res.json;
}

export function restaurantsQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.restaurants(),
        queryFn: fetchRestaurants,
        retry: false,
    });
}

export async function fetchTags(): Promise<ITag[]> {
    const res = await fetchBackendJson<ITag[], ApiError>("/tags", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les tags"));
    }

    return res.json;
}

export function tagsQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.tags(),
        queryFn: fetchTags,
        retry: false,
    });
}

export type CreateTagInput = {
    name: string;
};

async function createTag(input: CreateTagInput): Promise<ITag> {
    const res = await fetchBackendJson<ITag, ApiError>("/tags", "POST", {
        body: JSON.stringify({ name: input.name }),
        headers: APPLICATION_JSON_HEADERS,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer ce tag"));
    }

    return res.json;
}

export function useCreateTagMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateTagInput) => createTag(input),
        onSuccess: (tag) => {
            queryClient.setQueryData<ITag[]>(queryKeys.tags(), (old) => {
                if (!old) return [tag];
                return [tag, ...old.filter((t) => t.id !== tag.id)];
            });
        },
    });
}

type ToggleRestaurantChoiceResponse =
    | {
          message: string;
          choice: {
              id: number;
              restaurantId: number;
              userId: number;
              createdAt: string;
          };
      }
    | {
          message: string;
      };

async function toggleRestaurantChoice(
    restaurantId: number,
): Promise<ToggleRestaurantChoiceResponse> {
    const res = await fetchBackendJson<ToggleRestaurantChoiceResponse, ApiError>(
        "/createOrUpdateRestaurantChoice",
        "POST",
        {
            body: JSON.stringify({ restaurantId }),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de sélectionner ce restaurant"));
    }

    return res.json;
}

export function useToggleRestaurantChoiceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (restaurantId: number) => toggleRestaurantChoice(restaurantId),
        onSuccess: (data, restaurantId) => {
            const me = queryClient.getQueryData<IUserData>(queryKeys.me()) ?? null;
            const userId = me?.id ?? null;
            const prevDailyChoice = me?.dailyChoice ?? null;

            const nextDailyChoice = "choice" in data ? restaurantId : null;

            queryClient.setQueryData<IUserData>(queryKeys.me(), (old) => {
                if (!old) return old;
                return { ...old, dailyChoice: nextDailyChoice };
            });

            if (userId === null) return;

            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((restaurant) => {
                    let nextChoices = restaurant.choices;

                    // Remove choice from previous restaurant when switching.
                    if (
                        prevDailyChoice !== null &&
                        prevDailyChoice !== nextDailyChoice &&
                        restaurant.id === prevDailyChoice
                    ) {
                        nextChoices = nextChoices.filter((id) => id !== userId);
                    }

                    // Update clicked restaurant.
                    if (restaurant.id === restaurantId) {
                        if (nextDailyChoice === restaurantId) {
                            if (!nextChoices.includes(userId)) {
                                nextChoices = [...nextChoices, userId];
                            }
                        } else {
                            nextChoices = nextChoices.filter((id) => id !== userId);
                        }
                    }

                    if (nextChoices === restaurant.choices) return restaurant;
                    return { ...restaurant, choices: nextChoices };
                });
            });
        },
    });
}

export type UpsertRestaurantNoteInput = {
    restaurantId: number;
    note: NotesOption;
};

async function upsertRestaurantNote(input: UpsertRestaurantNoteInput): Promise<INotes> {
    const body = new FormData();
    body.append("restaurant_id", input.restaurantId.toString());
    body.append("note", input.note);

    const res = await fetchBackendJson<INotes, ApiError>("/notes", "POST", {
        body,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible d'enregistrer cette note"));
    }

    return res.json;
}

export function useUpsertRestaurantNoteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpsertRestaurantNoteInput) => upsertRestaurantNote(input),
        onSuccess: (note) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((restaurant) => {
                    if (restaurant.id !== note.restaurantId) return restaurant;

                    const nextNotes = [
                        note,
                        ...restaurant.notes.filter((n) => n.userId !== note.userId),
                    ];
                    return { ...restaurant, notes: nextNotes };
                });
            });
        },
    });
}

export type CreateRestaurantReviewInput = {
    restaurantId: number;
    comment: string;
    image?: File | null;
};

type CreateRestaurantReviewResponse = {
    message: string;
    restaurantReview: IReview;
};

async function createRestaurantReview(
    input: CreateRestaurantReviewInput,
): Promise<CreateRestaurantReviewResponse> {
    const body = new FormData();
    body.append("comment", input.comment);
    if (input.image) {
        body.append("image", input.image);
    }

    const res = await fetchBackendJson<CreateRestaurantReviewResponse, ApiError>(
        `/restaurants/${input.restaurantId}/reviews`,
        "POST",
        {
            body,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible d'ajouter cet avis"));
    }

    return res.json;
}

export function useCreateRestaurantReviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateRestaurantReviewInput) => createRestaurantReview(input),
        onSuccess: async (data) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;
                return old.map((r) => {
                    if (r.id !== data.restaurantReview.restaurantId) return r;

                    const nextReviews = [
                        data.restaurantReview,
                        ...r.reviews.filter((rev) => rev.id !== data.restaurantReview.id),
                    ];

                    return { ...r, reviews: nextReviews };
                });
            });
        },
    });
}

export type DeleteRestaurantReviewInput = {
    restaurantId: number;
    reviewId: number;
};

type DeleteRestaurantReviewResponse = {
    message: string;
    deletedId: number;
};

async function deleteRestaurantReview(
    input: DeleteRestaurantReviewInput,
): Promise<DeleteRestaurantReviewResponse> {
    const res = await fetchBackendJson<DeleteRestaurantReviewResponse, ApiError>(
        `/restaurants/${input.restaurantId}/reviews/${input.reviewId}`,
        "DELETE",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer cet avis"));
    }

    return res.json;
}

export function useDeleteRestaurantReviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DeleteRestaurantReviewInput) => deleteRestaurantReview(input),
        onSuccess: (data) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                return old.map((restaurant) => {
                    if (!restaurant.reviews.some((r) => r.id === data.deletedId)) return restaurant;
                    return {
                        ...restaurant,
                        reviews: restaurant.reviews.filter((r) => r.id !== data.deletedId),
                    };
                });
            });
        },
    });
}

export type UpdateRestaurantReviewInput = {
    restaurantId: number;
    reviewId: number;
    comment: string;
    image?: File | null;
};

type UpdateRestaurantReviewResponse = {
    message: string;
    updatedRestaurantReview: IReview;
};

async function updateRestaurantReview(
    input: UpdateRestaurantReviewInput,
): Promise<UpdateRestaurantReviewResponse> {
    const body = new FormData();
    body.append("comment", input.comment);
    if (input.image) {
        body.append("image", input.image);
    }

    const res = await fetchBackendJson<UpdateRestaurantReviewResponse, ApiError>(
        `/restaurants/${input.restaurantId}/reviews/${input.reviewId}`,
        "PUT",
        {
            body,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de modifier cet avis"));
    }

    return res.json;
}

export function useUpdateRestaurantReviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateRestaurantReviewInput) => updateRestaurantReview(input),
        onSuccess: (data) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;

                const updated = data.updatedRestaurantReview;

                return old.map((restaurant) => {
                    if (restaurant.id !== updated.restaurantId) return restaurant;

                    const nextReviews = [
                        updated,
                        ...restaurant.reviews.filter((review) => review.id !== updated.id),
                    ];

                    return {
                        ...restaurant,
                        reviews: nextReviews,
                    };
                });
            });
        },
    });
}

export type UpsertRestaurantInput = {
    id?: number;
    name: string;
    description: string;
    lat: number;
    lng: number;
    websiteLink?: string;
    averagePrice?: number | null;
    tagIds: number[];
    image?: File | null;
};

function buildRestaurantFormData(input: UpsertRestaurantInput) {
    const body = new FormData();

    body.append("name", input.name);
    body.append("description", input.description);
    body.append("lat", String(input.lat));
    body.append("lng", String(input.lng));

    if (input.websiteLink && input.websiteLink.trim() !== "") {
        body.append("websiteLink", input.websiteLink.trim());
    }

    if (input.averagePrice != null) {
        body.append("averagePrice", String(input.averagePrice));
    }

    for (const tagId of input.tagIds) {
        body.append("tags[]", tagId.toString());
    }

    if (input.image) {
        body.append("image", input.image);
    }

    return body;
}

async function createRestaurant(input: UpsertRestaurantInput): Promise<IRestaurant> {
    const body = buildRestaurantFormData(input);

    const res = await fetchBackendJson<IRestaurant, ApiError>("/restaurants", "POST", { body });

    if (!res.ok) {
        throw new Error(
            getErrorMessage(res.json, `Impossible de créer le restaurant ${input.name}`),
        );
    }

    return res.json;
}

export function useCreateRestaurantMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpsertRestaurantInput) => createRestaurant(input),
        onSuccess: (restaurant) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return [restaurant];
                return [restaurant, ...old.filter((r) => r.id !== restaurant.id)];
            });
        },
    });
}

async function updateRestaurant(input: UpsertRestaurantInput): Promise<IRestaurant> {
    if (input.id == null) {
        throw new Error("Restaurant id manquant");
    }

    const body = buildRestaurantFormData(input);

    const res = await fetchBackendJson<IRestaurant, ApiError>(`/restaurants/${input.id}`, "PUT", {
        body,
    });

    if (!res.ok) {
        throw new Error(
            getErrorMessage(res.json, `Impossible de modifier le restaurant ${input.name}`),
        );
    }

    return res.json;
}

export function useUpdateRestaurantMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpsertRestaurantInput) => updateRestaurant(input),
        onSuccess: (restaurant) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return [restaurant];
                return old.map((r) => (r.id === restaurant.id ? restaurant : r));
            });
        },
    });
}

export type DeleteRestaurantInput = {
    restaurantId: number;
};

type DeleteRestaurantResponse = {
    id: number;
    deleted: boolean;
};

async function deleteRestaurant(input: DeleteRestaurantInput): Promise<DeleteRestaurantResponse> {
    const res = await fetchBackendJson<DeleteRestaurantResponse, ApiError>(
        `/restaurants/${input.restaurantId}`,
        "DELETE",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer ce restaurant"));
    }

    return res.json;
}

export function useDeleteRestaurantMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DeleteRestaurantInput) => deleteRestaurant(input),
        onSuccess: (data) => {
            queryClient.setQueryData<IRestaurant[]>(queryKeys.restaurants(), (old) => {
                if (!old) return old;
                return old.filter((r) => r.id !== data.id);
            });
        },
    });
}
