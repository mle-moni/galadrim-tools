import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import type { IRestaurant } from "@galadrim-tools/shared";

import { meQueryOptions } from "@/integrations/backend/auth";
import { officesQueryOptions } from "@/integrations/backend/offices";
import { usersQueryOptions } from "@/integrations/backend/users";
import { restaurantsQueryOptions, tagsQueryOptions } from "@/integrations/backend/miams";

import { buildUsernameById, MAX_ZOOM, sortedRestaurantNames } from "./utils";
import { useMiamsSocketSync } from "./use-miams-socket-sync";

export function useMiamsPageController(input: { selectedRestaurantId?: number; zoom?: number }) {
    const [mobileListOpen, setMobileListOpen] = useState(false);

    const meQuery = useQuery(meQueryOptions());
    const restaurantsQuery = useQuery(restaurantsQueryOptions());
    const tagsQuery = useQuery(tagsQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());
    const usersQuery = useQuery(usersQueryOptions());

    useMiamsSocketSync(meQuery.data);

    const meId = meQuery.data?.id ?? null;
    const myDailyChoiceId = meQuery.data?.dailyChoice ?? null;
    const isMiamAdmin = ((meQuery.data?.rights ?? 0) & 0b1000) !== 0;

    const zoomFromSearch = input.zoom ?? MAX_ZOOM;

    const selectedOfficeId = useMemo(() => {
        const offices = officesQuery.data ?? [];
        const meOfficeId = meQuery.data?.officeId ?? null;

        if (meOfficeId !== null) {
            const found = offices.find((o) => o.id === meOfficeId);
            if (found) return meOfficeId;
        }

        const paris = offices.find((o) => o.name.toLowerCase().includes("paris"));
        if (paris) return paris.id;

        return offices[0]?.id ?? null;
    }, [meQuery.data?.officeId, officesQuery.data]);

    const [search, setSearch] = useState("");

    useEffect(() => {
        if (input.selectedRestaurantId != null) {
            setSearch("");
        }
    }, [input.selectedRestaurantId]);

    const selectedRestaurant = useMemo(() => {
        if (input.selectedRestaurantId == null) return null;
        return restaurantsQuery.data?.find((r) => r.id === input.selectedRestaurantId) ?? null;
    }, [input.selectedRestaurantId, restaurantsQuery.data]);

    const restaurantsFuse = useMemo(() => {
        return new Fuse(restaurantsQuery.data ?? [], {
            includeScore: true,
            keys: ["name", "description", "tags.name"],
        });
    }, [restaurantsQuery.data]);

    const filteredRestaurants = useMemo(() => {
        const restaurants = restaurantsQuery.data ?? [];
        const trimmedSearch = search.trim();

        if (!trimmedSearch) {
            return sortedRestaurantNames(restaurants);
        }

        return restaurantsFuse
            .search(trimmedSearch)
            .filter((result) => (result.score ?? 0) < 0.5)
            .map((result) => result.item);
    }, [restaurantsFuse, restaurantsQuery.data, search]);

    const restaurantsForMap = useMemo(() => {
        if (!selectedRestaurant) return filteredRestaurants;
        if (filteredRestaurants.some((r) => r.id === selectedRestaurant.id))
            return filteredRestaurants;
        return [selectedRestaurant, ...filteredRestaurants];
    }, [filteredRestaurants, selectedRestaurant]);

    const restaurantChoices = useMemo(() => {
        const restaurants = restaurantsQuery.data ?? [];

        return restaurants
            .filter((restaurant) => restaurant.choices.length > 0)
            .slice()
            .sort((a, b) => {
                const byCount = b.choices.length - a.choices.length;
                if (byCount !== 0) return byCount;
                return a.name.localeCompare(b.name);
            });
    }, [restaurantsQuery.data]);

    const totalDailyChoices = useMemo(() => {
        return restaurantChoices.reduce((acc, r) => acc + r.choices.length, 0);
    }, [restaurantChoices]);

    const usernameById = useMemo(() => {
        return buildUsernameById(usersQuery.data ?? []);
    }, [usersQuery.data]);

    const isLoading =
        meQuery.isLoading ||
        restaurantsQuery.isLoading ||
        tagsQuery.isLoading ||
        officesQuery.isLoading ||
        usersQuery.isLoading;

    return {
        mobileListOpen,
        setMobileListOpen,
        meQuery,
        restaurantsQuery,
        tagsQuery,
        officesQuery,
        usersQuery,
        meId,
        myDailyChoiceId,
        isMiamAdmin,
        zoomFromSearch,
        selectedOfficeId,
        search,
        setSearch,
        selectedRestaurant,
        filteredRestaurants,
        restaurantsForMap,
        restaurantChoices,
        totalDailyChoices,
        usernameById,
        isLoading,
    } as const;
}

export function isRestaurantOwner(restaurant: IRestaurant, meId: number | null) {
    if (meId === null) return false;
    return restaurant.userId === meId;
}
