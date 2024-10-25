import { Home } from "@mui/icons-material";
import { Box, Breadcrumbs, Chip, Typography } from "@mui/material";
import { type CSSProperties, useMemo } from "react";
import { Link } from "react-router-dom";
import { useIsMediumScreen } from "../../../hooks/useIsMobile";
import { RoundedLinks } from "../../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../../reusableComponents/layouts/MainLayout";
import { useOfficeFloorSelect } from "../useOfficeFloorSelect";
import { useOfficeRoomSelect } from "../useOfficeRoomSelect";
import { useOfficeSelect } from "../useOfficeSelect";
import { ShowOfficeFloorAdmin } from "./ShowOfficeFloorAdmin";

const LINK_STYLE: CSSProperties = { color: "black", textDecoration: "none", fontSize: 26 };
const BASE_URL = "/office-rooms/admin";

export const OfficeRoomsAdminPage = () => {
    const { officesOptions, selectedOffice, setSelectedOfficeFromId } = useOfficeSelect(BASE_URL);
    const { officeFloorsOptions, selectedOfficeFloor, setSelectedOfficeFloorFromId } =
        useOfficeFloorSelect(selectedOffice, BASE_URL);
    const { officeRooms, officeRoomsOptions, selectedOfficeRoom, setSelectedOfficeRoomFromId } =
        useOfficeRoomSelect(selectedOfficeFloor, BASE_URL);

    const isMediumScreen = useIsMediumScreen();
    const offsetHeight = useMemo(() => {
        if (isMediumScreen) return 0;
        if (selectedOfficeRoom) return 300;
        return 450;
    }, [isMediumScreen, selectedOfficeRoom]);

    return (
        <MainLayout fullscreen>
            <RoundedLinks linkInfos={[{ Icon: Home, link: "/" }]} />
            <Box
                sx={{
                    width: "100%",
                    height: "80vh",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Breadcrumbs>
                        {selectedOffice && (
                            <Link style={LINK_STYLE} to={`${BASE_URL}/${selectedOffice.id}`}>
                                {selectedOffice.name}
                            </Link>
                        )}
                        {selectedOffice && selectedOfficeFloor && (
                            <Link
                                style={LINK_STYLE}
                                to={`${BASE_URL}/${selectedOffice.id}/${selectedOfficeFloor.id}`}
                            >
                                Étage {selectedOfficeFloor.floor}
                            </Link>
                        )}
                        {selectedOffice && selectedOfficeFloor && selectedOfficeRoom && (
                            <Typography style={LINK_STYLE}>{selectedOfficeRoom.name}</Typography>
                        )}
                    </Breadcrumbs>
                </Box>
                {!selectedOfficeRoom && (
                    <Box
                        sx={{
                            display: "flex",
                            width: "100%",
                            minHeight: "100px",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {selectedOffice === null &&
                            officesOptions.map((o) => (
                                <Chip
                                    label={o.label}
                                    key={o.value}
                                    onClick={() => setSelectedOfficeFromId(o.value)}
                                />
                            ))}
                        {selectedOfficeFloor === null &&
                            officeFloorsOptions.map((o) => (
                                <Chip
                                    label={o.label}
                                    key={o.value}
                                    onClick={() => setSelectedOfficeFloorFromId(o.value)}
                                />
                            ))}

                        {officeRoomsOptions.map((o) => (
                            <Chip
                                label={o.label}
                                key={o.value}
                                onClick={() => setSelectedOfficeRoomFromId(o.value)}
                            />
                        ))}
                    </Box>
                )}
                {selectedOffice && selectedOfficeFloor && (
                    <ShowOfficeFloorAdmin
                        selectedOffice={selectedOffice}
                        selectedOfficeFloor={selectedOfficeFloor}
                        rooms={officeRooms}
                        selectedRoom={selectedOfficeRoom}
                        searchText={""}
                        numberOfFloors={1}
                        offsetHeight={offsetHeight}
                        reservations={[]}
                    />
                )}
            </Box>
        </MainLayout>
    );
};

export default OfficeRoomsAdminPage;
