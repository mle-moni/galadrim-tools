import L from 'leaflet'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { SaveurStore } from '../../../globalStores/SaveurStore'
import { clipboardCopy } from '../../../reusableComponents/auth/WhoamiStore'
import { NotedRestaurantMarkerIcon } from '../../../reusableComponents/saveur/markers/NotedRestaurantMarker'
import { RestaurantMarkerIcon } from '../../../reusableComponents/saveur/markers/RestaurantMarker'
import { notifyError, notifySuccess } from '../../../utils/notification'

export const RestaurantMarkers = observer<{ saveurStore: SaveurStore; userId: number }>(
    ({ saveurStore, userId }) => {
        const map = useMapEvents({
            dblclick(e) {
                const { lat, lng } = e.latlng
                const posStr = `${lat}, ${lng}`
                clipboardCopy(posStr, {
                    error: () => {
                        console.log('%c*********** POS *****************', 'color: #4287f5')
                        console.log(`%c${posStr}`, 'color: #a442f5')
                        console.log('%c*********************************', 'color: #4287f5')
                        notifyError(
                            'Impossible de copier dans le presse papier, ouvrez la console pour récuperer la position'
                        )
                    },
                    success: () => {
                        notifySuccess('Position copiée dans le presse papier')
                    },
                })
            },
        })

        useEffect(() => {
            saveurStore.initLeafletMap(map)
        }, [map, saveurStore])

        return (
            <>
                {saveurStore.restaurantsStore.restaurants.map((restaurant) => {
                    const { lat, lng, name, id, notes } = restaurant

                    const userNotedThisRestaurant = notes.find(
                        (restaurant) => restaurant.userId === userId
                    )
                    const icon =
                        userNotedThisRestaurant === undefined
                            ? RestaurantMarkerIcon
                            : NotedRestaurantMarkerIcon

                    return (
                        <Marker
                            key={id}
                            position={[lat, lng]}
                            icon={icon}
                            eventHandlers={{
                                click: () => {
                                    saveurStore.restaurantsStore.setRestaurantClicked(restaurant)
                                },
                            }}
                        >
                            <Popup offset={new L.Point(0, -20)}>{name}</Popup>
                        </Marker>
                    )
                })}
            </>
        )
    }
)
