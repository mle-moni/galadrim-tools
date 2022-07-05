import { SettingsPowerRounded } from '@mui/icons-material'
import { Popup as Popupt } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { useEffect,useState, useMemo, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { RestaurantMarkers } from '../../components/saveur/RestaurantMarkers'
import { SaveurStore } from '../../components/saveur/SaveurStore'
import { Box, Button, Fab, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.87025, 2.349225]



const SaveurPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])
    const [isOpen, setIsOpen] = useState(true)
    const ref = useRef<Popupt | null>(null)
    const toggleIsOpen = () => {
        setIsOpen(!isOpen)
    }

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
            {isOpen?(
              
            <header style={{color: 'red', zIndex: 2, top: 0, left: 0, bottom: 0, backgroundColor: 'white', width: "400px", position: 'absolute'}}>
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
            > <CloseIcon /> </Fab>
                <input type="text" name="name" style={{marginBottom:"50px", marginRight:'10px', marginTop:'20px', height: '50px', width: "90%", fontSize: "20px",borderRadius: '10px',backgroundColor: 'lightgrey',boxShadow: "5px 3px 3px grey"}}/>
                <div>
                    <div style={{height: "150px", width: '90%',backgroundColor: 'red', marginBottom:"15px"}}>
                    </div>
                    <div style={{height: "150px", width: '90%',backgroundColor: 'blue', marginBottom:"15px" }}></div>
                    <div style={{height: "150px", width: '90%',backgroundColor: 'red', marginBottom:"15px"}}></div>
                </div>
            </header>
            ):(
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
            > <SearchIcon /> </Fab>
            
            )}
        </>
    )
}

export default observer(SaveurPage)
