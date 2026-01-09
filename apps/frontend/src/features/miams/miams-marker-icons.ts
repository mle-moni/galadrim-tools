import L from "leaflet";

const RESTAURANT_MARKER_SIZE = 32;

export const RestaurantMarkerIcon = L.icon({
    iconUrl: "/maps/restaurant_marker.png",
    iconSize: [RESTAURANT_MARKER_SIZE, RESTAURANT_MARKER_SIZE],
    iconAnchor: [RESTAURANT_MARKER_SIZE / 2, RESTAURANT_MARKER_SIZE],
});

export const SelectedRestaurantMarkerIcon = L.icon({
    iconUrl: "/maps/selected_restaurant_marker.png",
    iconSize: [RESTAURANT_MARKER_SIZE, RESTAURANT_MARKER_SIZE],
    iconAnchor: [RESTAURANT_MARKER_SIZE / 2, RESTAURANT_MARKER_SIZE],
});

export const NotedRestaurantMarkerIcon = L.icon({
    iconUrl: "/maps/noted_restaurant_marker.png",
    iconSize: [RESTAURANT_MARKER_SIZE, RESTAURANT_MARKER_SIZE],
    iconAnchor: [RESTAURANT_MARKER_SIZE / 2, RESTAURANT_MARKER_SIZE],
});

export const SelectedNotedRestaurantMarkerIcon = L.icon({
    iconUrl: "/maps/selected_noted_restaurant_marker.png",
    iconSize: [RESTAURANT_MARKER_SIZE, RESTAURANT_MARKER_SIZE],
    iconAnchor: [RESTAURANT_MARKER_SIZE / 2, RESTAURANT_MARKER_SIZE],
});

const HOUSE_MARKER_SIZE = 42;

export const HouseMarkerIcon = L.icon({
    iconUrl: "/maps/house_marker.png",
    iconSize: [HOUSE_MARKER_SIZE, HOUSE_MARKER_SIZE],
    iconAnchor: [HOUSE_MARKER_SIZE / 2, HOUSE_MARKER_SIZE],
});
