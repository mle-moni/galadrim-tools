import type { IRestaurant, NotesOption } from "@galadrim-tools/shared";

import { getApiUrl } from "@/integrations/backend/client";

export const MAX_ZOOM = 18;

export function getMyNote(restaurant: IRestaurant, userId: number | null) {
    if (userId === null) return null;
    return restaurant.notes.find((n) => n.userId === userId)?.note ?? null;
}

export function formatPrice(value: number | null) {
    if (value == null) return null;
    return `${value.toFixed(0)}€`;
}

export function resolveBackendUrl(pathOrUrl: string) {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
    const base = getApiUrl().replace(/\/$/, "");
    return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function buildMiamsSearchParams(input: { restaurantId?: number; zoom?: number }) {
    const params = new URLSearchParams();
    if (input.restaurantId != null) params.set("restaurantId", String(input.restaurantId));
    if (input.zoom != null) params.set("zoom", String(input.zoom));
    return params;
}

export function sortByCreatedAtDesc<T extends { createdAt: string }>(items: readonly T[]) {
    return items.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function sortedRestaurantNames(restaurants: readonly IRestaurant[]) {
    return restaurants.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function buildUsernameById(users: Array<{ id: number; username: string }>) {
    const map = new Map<number, string>();
    for (const user of users) {
        map.set(user.id, user.username);
    }
    return map;
}

export type MutationLike<TVariables, TData = unknown> = {
    isPending: boolean;
    mutate: (variables: TVariables, options?: { onSuccess?: (data: TData) => void }) => void;
};

export type ToggleMutationLike = MutationLike<number>;

export type UpsertNoteMutationLike = MutationLike<{ restaurantId: number; note: NotesOption }>;

export type DeleteRestaurantMutationLike = MutationLike<{ restaurantId: number }>;

export type CreateReviewMutationLike = MutationLike<{
    restaurantId: number;
    comment: string;
    image: File | null;
}>;

export type UpdateReviewMutationLike = MutationLike<{
    restaurantId: number;
    reviewId: number;
    comment: string;
}>;

export type DeleteReviewMutationLike = MutationLike<{
    restaurantId: number;
    reviewId: number;
}>;
