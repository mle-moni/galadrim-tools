import L from 'leaflet'
import { getApiUrl } from '../../../api/fetch'

const MARKER_SIZE = 32

export const NotedRestaurantMarkerIcon = L.icon({
    iconUrl: getApiUrl() + '/maps/noted_restaurant_marker.png',
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
})
