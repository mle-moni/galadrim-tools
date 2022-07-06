import { SettingsPowerRounded } from '@mui/icons-material'
import { Popup as Popupt } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { observer } from 'mobx-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { RestaurantMarkers } from '../../components/saveur/RestaurantMarkers'
import { SaveurStore } from '../../components/saveur/SaveurStore'
import { Fab} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantCard from '../../components/RestaurantCard'

const POSITION_LOCAUX_BONNE_NOUVELLE: [number, number] = [48.87025, 2.349225]

const SaveurPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])
    const ref = useRef<Popupt | null>(null)
    
    const toggleIsOpen = () => {
        saveurStore.toggeleftMenu()
    }

    useEffect(() => {
        if (ref.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const test = ref.current as any
            const image = test._source._icon
            image.style.filter = 'hue-rotate(165deg)'
        }
    }, [ref.current])

    const [searchTerm, setSearchTerm] = useState('');
    const handleChangeTerm = (e) => {
    let value = e.target.value;
    setSearchTerm(value);

  };
  console.log(searchTerm);

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
            {saveurStore.leftMenuIsOpen?(
              
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
                <input type="text" name="name" placeholder= "Rechercher" onChange={handleChangeTerm} style={{marginBottom:"45px", marginRight:'10px', marginTop:'25px', height: '40px', width: "90%", fontSize: "20px",borderRadius: '10px',backgroundColor: 'lightgrey',boxShadow: "5px 3px 3px grey"}}/>
                <div>
                    <RestaurantCard searchTerm={searchTerm}/> 
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
            > <MenuIcon /> </Fab>
            
            )}
        </>
    )
}

export default observer(SaveurPage)
