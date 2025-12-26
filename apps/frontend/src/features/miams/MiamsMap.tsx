import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef } from "react";
import type { LeafletMouseEvent } from "leaflet";
import type { ApiOffice, IRestaurant } from "@galadrim-tools/shared";
import { toast } from "sonner";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { setupLeafletDefaultIcons } from "./leaflet-default-icons";
import {
    HouseMarkerIcon,
    NotedRestaurantMarkerIcon,
    RestaurantMarkerIcon,
    SelectedNotedRestaurantMarkerIcon,
    SelectedRestaurantMarkerIcon,
} from "./miams-marker-icons";

const NANTES_COORDINATES_VALUES: [number, number] = [47.2126404424623, -1.5642226533183083];

const DEFAULT_ZOOM = 17;
const MAX_ZOOM = 18;
const SELECTED_ZOOM = MAX_ZOOM;

function FlyToSelectedRestaurant(props: {
    restaurantId: number | null;
    center: [number, number] | null;
    zoom: number;
}) {
    const map = useMap();
    const lastRestaurantIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (props.restaurantId === null) {
            lastRestaurantIdRef.current = null;
            return;
        }
        if (!props.center) return;

        if (lastRestaurantIdRef.current === props.restaurantId) return;
        lastRestaurantIdRef.current = props.restaurantId;

        map.flyTo(props.center, props.zoom, { duration: 0.5 });
    }, [map, props.center, props.restaurantId, props.zoom]);

    return null;
}

function FlyToOffice(props: {
    center: [number, number] | null;
    enabled: boolean;
    zoom: number | null;
}) {
    const map = useMap();
    const lastKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!props.enabled) return;
        if (!props.center) return;

        const key = `${props.center[0]},${props.center[1]}`;
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;

        const zoom = props.zoom ?? DEFAULT_ZOOM;
        map.flyTo(props.center, zoom, { duration: 0.5 });
    }, [props.center, props.enabled, props.zoom, map]);

    return null;
}

function MapEvents(props: { onZoomChange?: (zoom: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            props.onZoomChange?.(map.getZoom());
        },
        dblclick: async (event: LeafletMouseEvent) => {
            const text = `${event.latlng.lat},${event.latlng.lng}`;

            try {
                await navigator.clipboard.writeText(text);
                toast.success("Coordonnées copiées");
            } catch {
                toast.error("Impossible de copier les coordonnées");
            }
        },
    });

    return null;
}

export default function MiamsMap(props: {
    restaurants: IRestaurant[];
    offices: ApiOffice[];
    selectedOfficeId: number | null;
    selectedRestaurantId?: number;
    userId: number | null;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
    onSelectRestaurantId?: (restaurantId: number) => void;
}) {
    useEffect(() => {
        setupLeafletDefaultIcons();
    }, []);

    const selectedRestaurant = useMemo(() => {
        if (props.selectedRestaurantId == null) return null;

        const selectedId = String(props.selectedRestaurantId);
        return props.restaurants.find((restaurant) => String(restaurant.id) === selectedId) ?? null;
    }, [props.restaurants, props.selectedRestaurantId]);

    const selectedRestaurantCenter = useMemo((): [number, number] | null => {
        if (!selectedRestaurant) return null;
        return [+selectedRestaurant.lat, +selectedRestaurant.lng];
    }, [selectedRestaurant]);

    const selectedOfficeCenter = useMemo((): [number, number] | null => {
        if (props.selectedOfficeId == null) return null;

        const selectedId = String(props.selectedOfficeId);
        const office = props.offices.find((o) => String(o.id) === selectedId) ?? null;
        if (!office) return null;

        return [office.lat, office.lng];
    }, [props.offices, props.selectedOfficeId]);

    const center: [number, number] = useMemo(() => {
        if (selectedRestaurantCenter) return selectedRestaurantCenter;
        if (selectedOfficeCenter) return selectedOfficeCenter;

        if (props.restaurants.length === 0) {
            return NANTES_COORDINATES_VALUES;
        }

        const lat =
            props.restaurants.reduce((acc, r) => acc + +r.lat, 0) / props.restaurants.length;
        const lng =
            props.restaurants.reduce((acc, r) => acc + +r.lng, 0) / props.restaurants.length;

        return [lat, lng];
    }, [props.restaurants, selectedOfficeCenter, selectedRestaurantCenter]);

    const selectedRestaurantZoom = props.zoom ?? SELECTED_ZOOM;

    return (
        <MapContainer
            className="relative z-0 h-full w-full"
            center={center}
            zoom={DEFAULT_ZOOM}
            maxZoom={MAX_ZOOM}
            scrollWheelZoom
            doubleClickZoom={false}
            zoomControl={false}
        >
            <MapEvents onZoomChange={props.onZoomChange} />
            <FlyToSelectedRestaurant
                restaurantId={selectedRestaurant?.id ?? null}
                center={selectedRestaurantCenter}
                zoom={selectedRestaurantZoom}
            />
            <FlyToOffice
                center={selectedOfficeCenter}
                enabled={!selectedRestaurantCenter}
                zoom={DEFAULT_ZOOM}
            />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://osm.mle-moni.fr/tile/{z}/{x}/{y}.png"
            />

            {props.offices.map((office) => (
                <Marker
                    key={office.id}
                    position={[office.lat, office.lng]}
                    icon={HouseMarkerIcon}
                />
            ))}

            {props.restaurants.map((restaurant) => {
                const isSelected = selectedRestaurant?.id === restaurant.id;
                const isNoted =
                    props.userId !== null &&
                    restaurant.notes.some((note) => note.userId === props.userId);

                const icon = isSelected
                    ? isNoted
                        ? SelectedNotedRestaurantMarkerIcon
                        : SelectedRestaurantMarkerIcon
                    : isNoted
                      ? NotedRestaurantMarkerIcon
                      : RestaurantMarkerIcon;

                return (
                    <Marker
                        key={restaurant.id}
                        position={[restaurant.lat, restaurant.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => props.onSelectRestaurantId?.(restaurant.id),
                        }}
                    />
                );
            })}
        </MapContainer>
    );
}
