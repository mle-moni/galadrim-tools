import { Loop } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Switch, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppStore } from "../../globalStores/AppStore";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { ValidLocations, type WorkspaceLocation } from "../../utils/rooms";
import { RoomCalendar } from "./RoomCalendar";

const RoomPage = () => {
    const defaultLocation = "saintPaul";
    const [fiveMinutesSlotMode, setFiveMinutesSlotMode] = useState(false);
    const params = useParams();

    const preselectLocation = () => {
        let storageVal = localStorage.getItem("selectedLocation") ?? defaultLocation;
        if (!ValidLocations.includes(storageVal)) {
            storageVal = defaultLocation;
            localStorage.setItem("selectedLocation", storageVal);
        }
        return storageVal as WorkspaceLocation;
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? "*");
    }, []);

    const [selectedLocation, setSelectedLocation] = useState<WorkspaceLocation>(
        preselectLocation(),
    );

    return (
        <MainLayout fullscreen>
            <div>
                <Box sx={{ position: "absolute", top: 32, left: 32, zIndex: 10 }}>
                    <Button
                        startIcon={<BackIcon />}
                        variant="contained"
                        onClick={() => AppStore.navigate("/rooms")}
                    >
                        Retour
                    </Button>
                </Box>
                <Box sx={{ position: "absolute", top: 32, left: 180, zIndex: 10 }}>
                    <Tooltip title="Charger toutes les réservations, par défaut seulement 200 réservations sont chargées">
                        <Button
                            startIcon={<Loop />}
                            variant="contained"
                            onClick={() => AppStore.eventsStore.fetchEvents(true)}
                        >
                            Charger plus
                        </Button>
                    </Tooltip>
                </Box>
                <Box sx={{ position: "absolute", top: 86, left: 32, zIndex: 10 }}>
                    <Box sx={{ display: "inline-flex" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={fiveMinutesSlotMode}
                                    onChange={() => setFiveMinutesSlotMode(!fiveMinutesSlotMode)}
                                />
                            }
                            label="slots de 5 minutes"
                            sx={{ userSelect: "none" }}
                        />
                        <RadioGroup
                            row
                            value={selectedLocation}
                            onChange={(_, newValue) => {
                                setSelectedLocation(newValue as WorkspaceLocation);
                                localStorage.setItem("selectedLocation", newValue);
                            }}
                        >
                            <FormControlLabel
                                value="saintPaul"
                                control={<Radio />}
                                label="Saint Paul"
                            />
                            <FormControlLabel value="nantes" control={<Radio />} label="Nantes" />
                        </RadioGroup>
                    </Box>
                </Box>
                <RoomCalendar step={fiveMinutesSlotMode ? 5 : 15} location={selectedLocation} />
            </div>
        </MainLayout>
    );
};

export default RoomPage;
