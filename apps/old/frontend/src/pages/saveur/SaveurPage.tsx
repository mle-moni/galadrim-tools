import { NANTES_COORDINATES_VALUES, PARIS_COORDINATES_VALUES } from "@galadrim-tools/shared";
import { Celebration, Euro, FormatListNumbered, Grade, Home, Schedule } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Box } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { observer } from "mobx-react-lite";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import { AppStore } from "../../globalStores/AppStore";
import { MAX_ZOOM } from "../../globalStores/SaveurStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { HouseMarkerIcon } from "../../reusableComponents/saveur/markers/HouseMarker";
import { LocauxSwitch } from "./LocauxSwitch";
import { getFavouriteLocauxIndex } from "./persistLocauxPreferences";
import { RestaurantMarkers } from "./restaurants/RestaurantMarkers";
import { SaveurLeftMenu } from "./restaurants/SaveurLeftMenu";
import { UserDailyChoices } from "./restaurants/UserDailyChoices";

export interface Locaux {
    name: string;
    position: [number, number];
}

export const POS_ALL_LOCAUX: Locaux[] = [
    {
        name: "Locaux Paris, Bonne Nouvelle",
        position: PARIS_COORDINATES_VALUES,
    },
    {
        name: "Locaux Nantes",
        position: NANTES_COORDINATES_VALUES,
    },
];

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type MapEventsProps = {};

const MapEvents = observer<MapEventsProps>(() => {
    const [, setSearchParams] = useSearchParams();

    const mapEvents = useMapEvents({
        zoomend: () => {
            setSearchParams((searchParams) => {
                const params: {
                    zoom?: string;
                    "restaurant-id"?: string;
                } = { zoom: mapEvents.getZoom().toString() };
                const restaurantId = searchParams.get("restaurant-id");
                if (restaurantId) params["restaurant-id"] = restaurantId;
                return new URLSearchParams(params);
            });
        },
    });

    return <></>;
});

const SaveurPage = observer(() => {
    const { saveurStore, authStore } = AppStore;

    useCheckConnection(authStore);

    if (authStore.connected === false) {
        return null;
    }

    const favouriteLocauxIndex = getFavouriteLocauxIndex();

    return (
        <>
            <RoundedLinks
                linkInfos={[
                    { Icon: Home, link: "/" },
                    { Icon: Grade, link: "saveur/myRestaurantNotes" },
                    { Icon: FormatListNumbered, link: "/saveur/restaurantsList/best" },
                    { Icon: Schedule, link: "saveur/restaurantsList/new" },
                    { Icon: Euro, link: "saveur/restaurantsList/leastExpensive" },
                    { Icon: AddIcon, link: "/saveur/createRestaurant" },
                    { Icon: Celebration, link: "/saveur/rewind", shiny: true },
                ]}
                horizontalPosition="right"
            />
            <MapContainer
                style={{
                    width: "100%",
                    height: "100%",
                    zIndex: 5,
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                }}
                center={POS_ALL_LOCAUX[favouriteLocauxIndex].position}
                zoom={17}
                maxZoom={MAX_ZOOM}
                scrollWheelZoom
                doubleClickZoom={false}
                zoomControl={false}
            >
                <MapEvents />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://osm.mle-moni.fr/tile/{z}/{x}/{y}.png"
                />
                {POS_ALL_LOCAUX.map(({ name, position }) => (
                    <Marker key={name} position={position} icon={HouseMarkerIcon}>
                        <Popup offset={new L.Point(0, -20)}>{name}</Popup>
                    </Marker>
                ))}
                <RestaurantMarkers saveurStore={saveurStore} userId={authStore.user.id} />
            </MapContainer>
            <SaveurLeftMenu saveurStore={saveurStore} />
            <UserDailyChoices saveurStore={saveurStore} />
            <Box
                sx={{
                    zIndex: 10,
                    position: "absolute",
                    left: "10px",
                    bottom: "10px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    p: 1,
                }}
            >
                <CustomLink to="/">
                    <BackIcon /> Retour à l'accueil
                </CustomLink>
            </Box>
            <LocauxSwitch saveurStore={saveurStore} />
        </>
    );
});

export default SaveurPage;
