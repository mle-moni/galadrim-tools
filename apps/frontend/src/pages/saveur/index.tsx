import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { HouseMarkerIcon } from '../../components/saveur/markers/HouseMarker'
import { RestaurantMarkers } from '../../components/saveur/RestaurantMarkers'
import { SaveurStore } from '../../components/saveur/SaveurStore'

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.87012, 2.34923]

const SaveurPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])

    return (
        <>
            <MapContainer
                style={{
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                }}
                center={POSITION_LOCAUX_BONNE_NOUVELLE}
                zoom={17}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://osm.mle-moni.fr/tile/{z}/{x}/{y}.png"
                />
                <Marker position={POSITION_LOCAUX_BONNE_NOUVELLE} icon={HouseMarkerIcon}>
                    <Popup offset={new L.Point(0, -20)}>Les locaux</Popup>
                </Marker>
                <RestaurantMarkers restaurantStore={saveurStore.restaurantsStore} />
            </MapContainer>
        </>
    )
}

export default observer(SaveurPage)
