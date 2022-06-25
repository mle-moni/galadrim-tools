import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.8702, 2.34925]

const SaveurPage = () => {
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
                    <Popup>Les locaux</Popup>
                </Marker>
            </MapContainer>
        </>
    )
}

export default observer(SaveurPage)
