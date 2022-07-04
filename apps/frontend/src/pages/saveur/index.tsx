import { Popup as Popupt } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { RestaurantMarkers } from '../../components/saveur/RestaurantMarkers'
import { SaveurStore } from '../../components/saveur/SaveurStore'

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.87025, 2.349225]

const SaveurPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])

    const ref = useRef<Popupt | null>(null)

    useEffect(() => {
        if (ref.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const test = ref.current as any
            const image = test._source._icon
            image.style.filter = 'hue-rotate(165deg)'
        }
    }, [ref.current])

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
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={POSITION_LOCAUX_BONNE_NOUVELLE}>
                    <Popup ref={ref}>Les locaux</Popup>
                </Marker>
                <RestaurantMarkers restaurantStore={saveurStore.restaurantsStore} />
            </MapContainer>
        </>
    )
}

export default observer(SaveurPage)
