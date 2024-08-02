import { Home } from "@mui/icons-material";
import StatsIcon from "@mui/icons-material/QueryStats";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import {
    AllFloors,
    Floor2,
    Floor3,
    Floor4,
} from "../../reusableComponents/WorkplaceSvg/WorkplaceSvg";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import type { WorkspaceLocation } from "../../utils/rooms";
import { RoomsHomePageStore } from "./RoomsHomePageStore";

const locationToComponent: Record<WorkspaceLocation, typeof Floor2 | (() => null)> = {
    saintPaul: AllFloors,
    saintPaul2: Floor2,
    saintPaul3: Floor3,
    saintPaul4: Floor4,
    nantes: () => null,
    bonneNouvelle: () => null,
};

const RoomsHomePage = observer(() => {
    const homePageStore = useMemo(() => new RoomsHomePageStore(), []);

    useEffect(() => {
        AppStore.eventsStore.setRoomName("");

        return () => homePageStore.cleanup();
    }, [homePageStore]);
    const [location, setLocation] = useState<WorkspaceLocation>("saintPaul");
    const { width, height } = useWindowDimensions();
    const shortestEdge = width < height ? width : height;
    const svgSize = Math.round(shortestEdge * 0.8);

    const WorkplaceComponent = locationToComponent[location];

    return (
        <MainLayout fullscreen>
            <RoundedLinks
                linkInfos={[
                    { Icon: Home, link: "/" },
                    { Icon: StatsIcon, link: "/rooms/statistics" },
                ]}
            />
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button
                    size="large"
                    variant="contained"
                    onClick={() => AppStore.navigate("/room")}
                    sx={{
                        mt: -3.5,
                    }}
                >
                    Voir toutes les salles
                </Button>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <RadioGroup
                    row
                    value={location}
                    onChange={(_, newValue) => {
                        setLocation(newValue as WorkspaceLocation);
                    }}
                    sx={{ my: 2 }}
                >
                    <FormControlLabel value="saintPaul" control={<Radio />} label="Saint Paul" />
                    <FormControlLabel value="saintPaul2" control={<Radio />} label="Étage 2" />
                    <FormControlLabel value="saintPaul3" control={<Radio />} label="Étage 3" />
                    <FormControlLabel value="saintPaul4" control={<Radio />} label="Étage 4" />
                </RadioGroup>
            </Box>
            <CenteredDiv>
                <WorkplaceComponent
                    width={svgSize}
                    height={svgSize}
                    onClick={(room) => homePageStore.onClick(room)}
                    backgroundColor={(room) => homePageStore.getRoomColor(room)}
                    backgroundColorHover={(room) => homePageStore.getRoomMouseOverColor(room)}
                    onMouseOut={() => homePageStore.onMouseOut()}
                    key={homePageStore.svgKey}
                    getUserPictureUrl={(room) => homePageStore.getRoomUser(room)}
                />
            </CenteredDiv>
            <Typography
                variant="h5"
                style={{
                    transition: "all 1s",
                    color: homePageStore.focusedRoomName ? "black" : "rgba(0,0,0,0)",
                    textAlign: "center",
                }}
            >
                {homePageStore.focusedRoomName ?? (
                    <span style={{ visibility: "hidden" }}>____</span>
                )}
            </Typography>
        </MainLayout>
    );
});

export default RoomsHomePage;
