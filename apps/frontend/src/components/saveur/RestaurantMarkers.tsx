import L from 'leaflet'
import { observer } from 'mobx-react-lite'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { notifyError, notifySuccess } from '../../utils/notification'
import { clipboardCopy } from '../auth/WhoamiStore'
import { RestaurantMarkerIcon } from './markers/RestaurantMarker'
import { RestaurantsStore } from './RestaurantsStore'

export const RestaurantMarkers = observer<{ restaurantStore: RestaurantsStore }>(
    ({ restaurantStore }) => {
        useMapEvents({
            dblclick(e) {
                const { lat, lng } = e.latlng
                const posStr = `${lat}, ${lng}`
                clipboardCopy(posStr, {
                    error: () => {
                        console.log('%c*********** POS *****************', 'color: #4287f5')
                        console.log(`%c${posStr}`, 'color: #a442f5')
                        console.log('%c*********************************', 'color: #4287f5')
                        notifyError(
                            'impossible de copier dans le presse papier, ouvrez la console pour récuperer la position'
                        )
                    },
                    success: () => {
                        notifySuccess('position copiée dans le presse papier')
                    },
                })
            },
        })

        return (
            <>
                {restaurantStore.restaurants.map(({ lat, lng, name, id }) => (
                    <Marker key={id} position={[lat, lng]} icon={RestaurantMarkerIcon}>
                        <Popup offset={new L.Point(0, -20)}>{name}</Popup>
                    </Marker>
                ))}
            </>
        )
    }
)
