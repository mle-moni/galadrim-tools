import { Home } from "@mui/icons-material";
import { Box, Breadcrumbs, Chip, Typography } from "@mui/material";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { ShowOfficeFloor } from "./ShowOfficeFloor";
import { useOfficeFloorSelect } from "./useOfficeFloorSelect";
import { useOfficeRoomSelect } from "./useOfficeRoomSelect";
import { useOfficeSelect } from "./useOfficeSelect";

const LINK_STYLE: CSSProperties = { color: "black", textDecoration: "none", fontSize: 26 };

export const OfficeRoomsPage = () => {
    const { officesOptions, selectedOffice, setSelectedOfficeFromId } = useOfficeSelect();
    const { officeFloors, officeFloorsOptions, selectedOfficeFloor, setSelectedOfficeFloorFromId } =
        useOfficeFloorSelect(selectedOffice);
    const {
        officeRooms,
        officeRoomsOptions,
        selectedOfficeRoom,
        setSelectedOfficeRoomFromId,
        nonFilteredOfficeRooms,
    } = useOfficeRoomSelect(selectedOfficeFloor);

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
                            <Link style={LINK_STYLE} to={`/office-rooms/${selectedOffice.id}`}>
                                {selectedOffice.name}
                            </Link>
                        )}
                        {selectedOffice && selectedOfficeFloor && (
                            <Link
                                style={LINK_STYLE}
                                to={`/office-rooms/${selectedOffice.id}/${selectedOfficeFloor.id}`}
                            >
                                Étage {selectedOfficeFloor.floor}
                            </Link>
                        )}
                        {selectedOffice && selectedOfficeFloor && selectedOfficeRoom && (
                            <Typography style={LINK_STYLE}>{selectedOfficeRoom.name}</Typography>
                        )}
                    </Breadcrumbs>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                        minHeight: "100px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
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

                    {selectedOfficeRoom === null &&
                        officeRoomsOptions.map((o) => (
                            <Chip
                                label={o.label}
                                key={o.value}
                                onClick={() => setSelectedOfficeRoomFromId(o.value)}
                            />
                        ))}
                </Box>
                {selectedOffice && selectedOfficeFloor && (
                    <ShowOfficeFloor
                        selectedOffice={selectedOffice}
                        selectedOfficeFloor={selectedOfficeFloor}
                        rooms={officeRooms}
                        selectedRoom={selectedOfficeRoom}
                    />
                )}
                {selectedOffice && !selectedOfficeFloor && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {officeFloors.map((officeFloor) => (
                            <ShowOfficeFloor
                                key={officeFloor.id}
                                selectedOffice={selectedOffice}
                                selectedOfficeFloor={officeFloor}
                                rooms={nonFilteredOfficeRooms}
                                selectedRoom={selectedOfficeRoom}
                                numberOfFloors={officeFloors.length}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </MainLayout>
    );
};

export default OfficeRoomsPage;
