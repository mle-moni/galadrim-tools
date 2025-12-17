import type { IRestaurant } from "@galadrim-tools/shared";
import L from "leaflet";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import { MAX_ZOOM, type SaveurStore } from "../../../globalStores/SaveurStore";
import { clipboardCopy } from "../../../reusableComponents/auth/WhoamiStore";
import { NotedRestaurantMarkerIcon } from "../../../reusableComponents/saveur/markers/NotedRestaurantMarker";
import { RestaurantMarkerIcon } from "../../../reusableComponents/saveur/markers/RestaurantMarker";
import { SelectedNotedRestaurantMarkerIcon } from "../../../reusableComponents/saveur/markers/SelectedNotedRestaurantMarker";
import { SelectedRestaurantMarkerIcon } from "../../../reusableComponents/saveur/markers/SelectedRestaurantMarker";
import { notifyError, notifySuccess } from "../../../utils/notification";

const parseZoomLevel = (zoomRaw: string | null) => {
    if (zoomRaw) {
        const zoom = Number.parseInt(zoomRaw);
        if (Number.isNaN(zoomRaw) || zoom > MAX_ZOOM) {
            return MAX_ZOOM;
        }
        return zoom;
    }
    return MAX_ZOOM;
};

interface RestaurantMarkerProps {
    restaurant: IRestaurant;
    userId: number;
    saveurStore: SaveurStore;
}

const RestaurantMarker = observer<RestaurantMarkerProps>(({ saveurStore, restaurant, userId }) => {
    const [, setSearchParams] = useSearchParams();

    const { lat, lng, name, notes } = restaurant;
    const userNotedThisRestaurant = notes.find((note) => note.userId === userId);
    const selected = saveurStore.restaurantsStore.restaurantClicked?.id === restaurant.id;
    const icon =
        userNotedThisRestaurant === undefined
            ? selected
                ? SelectedRestaurantMarkerIcon
                : RestaurantMarkerIcon
            : selected
              ? SelectedNotedRestaurantMarkerIcon
              : NotedRestaurantMarkerIcon;

    return (
        <Marker
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
                click: () => {
                    setSearchParams(
                        (searchParams) =>
                            new URLSearchParams({
                                "restaurant-id": restaurant.id.toString(),
                                zoom: searchParams.get("zoom") ?? MAX_ZOOM.toString(),
                            }),
                    );
                },
            }}
        >
            <Popup offset={new L.Point(0, -20)}>{name}</Popup>
        </Marker>
    );
});

export const RestaurantMarkers = observer<{
    saveurStore: SaveurStore;
    userId: number;
}>(({ saveurStore, userId }) => {
    const map = useMapEvents({
        dblclick(e) {
            const { lat, lng } = e.latlng;
            const posStr = `${lat}, ${lng}`;
            clipboardCopy(posStr, {
                error: () => {
                    console.log("%c*********** POS *****************", "color: #4287f5");
                    console.log(`%c${posStr}`, "color: #a442f5");
                    console.log("%c*********************************", "color: #4287f5");
                    notifyError(
                        "Impossible de copier dans le presse papier, ouvrez la console pour récupérer la position",
                    );
                },
                success: () => {
                    notifySuccess("Position copiée dans le presse papier");
                },
            });
        },
    });

    useEffect(() => {
        saveurStore.initLeafletMap(map);
    }, [map, saveurStore]);

    const [searchParams] = useSearchParams();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const restaurantIdRaw = searchParams.get("restaurant-id");
        const zoomRaw = searchParams.get("zoom");
        if (restaurantIdRaw === null) return;
        const restaurantId = Number.parseInt(restaurantIdRaw);
        if (saveurStore.restaurantsStore.restaurantClicked?.id === restaurantId) return;
        const zoom = zoomRaw ? parseZoomLevel(zoomRaw) : undefined;
        saveurStore.flyToRestaurantId(restaurantId, zoom);
    }, [searchParams, saveurStore, saveurStore.restaurantsStore.loadingState.isLoading]);

    return (
        <>
            {saveurStore.restaurantsStore.restaurants.map((restaurant) => {
                return (
                    <RestaurantMarker
                        key={restaurant.id}
                        restaurant={restaurant}
                        userId={userId}
                        saveurStore={saveurStore}
                    />
                );
            })}
        </>
    );
});
