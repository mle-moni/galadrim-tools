import { observer } from 'mobx-react-lite'
import { Marker, Popup } from 'react-leaflet'
import { RestaurantsStore } from './RestaurantsStore'

export const RestaurantMarkers = observer<{ restaurantStore: RestaurantsStore }>(
    ({ restaurantStore }) => (
        <>
            {restaurantStore.restaurants.map(({ lat, lng, name, id }) => (
                <Marker key={id} position={[lat, lng]}>
                    <Popup>{name}</Popup>
                </Marker>
            ))}
        </>
    )
)
