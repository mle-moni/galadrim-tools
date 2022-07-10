import L from 'leaflet'
import { observer } from 'mobx-react-lite'
import { Marker, Popup } from 'react-leaflet'
import { RestaurantMarkerIcon } from './markers/RestaurantMarker'
import { RestaurantsStore } from './RestaurantsStore'

export const RestaurantMarkers = observer<{ restaurantStore: RestaurantsStore }>(
    ({ restaurantStore }) => (
        <>
            {restaurantStore.restaurants.map(({ lat, lng, name, id }) => (
                <Marker key={id} position={[lat, lng]} icon={RestaurantMarkerIcon}>
                    <Popup offset={new L.Point(0, -20)}>{name}</Popup>
                </Marker>
            ))}
        </>
    )
)
