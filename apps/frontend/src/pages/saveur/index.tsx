import { Close, Home, Menu } from '@mui/icons-material'
import { Fab } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { RoundedLinks } from '../../components/Link/RoundedLinks'
import RestaurantCard from '../../components/RestaurantCard'
import { HouseMarkerIcon } from '../../components/saveur/markers/HouseMarker'
import { RestaurantMarkers } from '../../components/saveur/RestaurantMarkers'
import { SaveurStore } from '../../components/saveur/SaveurStore'
import { notifyUser } from '../../utils/notification'

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.87012, 2.34923]

const SaveurPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])

    const [isOpen, setIsOpen] = useState(true)
    const toggleIsOpen = () => {
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        notifyUser('Work in progress', 'info', 2000)
    }, [])

    const [searchTerm, setSearchTerm] = useState('')

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: Home, link: '/' }]} />
            <MapContainer
                style={{
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                }}
                center={POSITION_LOCAUX_BONNE_NOUVELLE}
                zoom={17}
                maxZoom={18}
                scrollWheelZoom
                doubleClickZoom={false}
                zoomControl={false}
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
            {isOpen ? (
                <header
                    style={{
                        color: 'red',
                        zIndex: 2,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        width: '400px',
                        position: 'absolute',
                    }}
                >
                    <Fab
                        onClick={toggleIsOpen}
                        size="medium"
                        variant="circular"
                        color="primary"
                        sx={{
                            position: 'absolute',
                            top: 25,
                            left: 425,
                        }}
                    >
                        <Close />
                    </Fab>
                    <input
                        type="text"
                        name="name"
                        placeholder="Rechercher"
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                        }}
                        style={{
                            marginBottom: '45px',
                            marginRight: '10px',
                            marginTop: '25px',
                            height: '40px',
                            width: '90%',
                            fontSize: '20px',
                            borderRadius: '10px',
                            backgroundColor: 'lightgrey',
                            boxShadow: '5px 3px 3px grey',
                        }}
                    />
                    <div>
                        <RestaurantCard searchTerm={searchTerm} />
                    </div>
                </header>
            ) : (
                <Fab
                    onClick={toggleIsOpen}
                    size="medium"
                    variant="circular"
                    color="primary"
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 60,
                    }}
                >
                    <Menu />
                </Fab>
            )}
        </>
    )
}

export default observer(SaveurPage)
