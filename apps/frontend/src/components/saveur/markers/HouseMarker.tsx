import L from 'leaflet'
import { getApiUrl } from '../../../api/fetch'

const MARKER_SIZE = 42

export const HouseMarkerIcon = L.icon({
    iconUrl: getApiUrl() + '/maps/house_marker.png',
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
})
