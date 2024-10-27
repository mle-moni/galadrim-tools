import { CalendarMonth, Home } from "@mui/icons-material";
import { Box, Breadcrumbs, IconButton, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { type CSSProperties, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIsMediumScreen, useIsMobile } from "../../hooks/useIsMobile";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { ShowOfficeFloor } from "./ShowOfficeFloor";
import { TabChip } from "./TabChip";
import { UserSelect } from "./UserSelect";
import { type CalendarDateRange, OfficeRoomCalendar } from "./calendar/OfficeRoomCalendar";
import { useOfficeRoomCalendar } from "./calendar/useOfficeRoomCalendar";
import { useOfficeFloorSelect } from "./useOfficeFloorSelect";
import { useOfficeRoomSelect } from "./useOfficeRoomSelect";
import { useOfficeSelect } from "./useOfficeSelect";
import { useUserSelect } from "./useUserSelect";

const LINK_STYLE: CSSProperties = { color: "black", textDecoration: "none", fontSize: 26 };

export const OfficeRoomsPage = () => {
    const { officesOptions, selectedOffice, setSelectedOfficeFromId } = useOfficeSelect();
    const { officeFloors, officeFloorsOptions, selectedOfficeFloor, setSelectedOfficeFloorFromId } =
        useOfficeFloorSelect(selectedOffice);
    const { officeRooms, selectedOfficeRoom, setSelectedOfficeRoomFromId, nonFilteredOfficeRooms } =
        useOfficeRoomSelect(selectedOfficeFloor);
    const reservableRooms = useMemo(() => officeRooms.filter((r) => r.isBookable), [officeRooms]);
    const reservableRoomsOptions = useMemo(() => {
        return reservableRooms.map((r) => ({
            label: r.name,
            value: r.id,
        }));
    }, [reservableRooms]);
    const calendarOptions = useMemo<[number | null, CalendarDateRange]>(
        () => [selectedOffice?.id ?? null, [new Date()]],
        [selectedOffice],
    );
    const { reservationsQuery } = useOfficeRoomCalendar(calendarOptions[0], calendarOptions[1]);
    const reservations = useMemo(() => reservationsQuery.data ?? [], [reservationsQuery.data]);

    const isMediumScreen = useIsMediumScreen();
    const [searchText, setSearchText] = useState("");
    const { selectedUser, setSelectedUserFromId, usersOptions, selectedUserOption } =
        useUserSelect();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isMobile = useIsMobile();

    return (
        <MainLayout fullscreen hiddenOverflow={!isMobile}>
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
                    {!selectedOfficeRoom && selectedOffice && (
                        <Tooltip title="Voir le Calendrier">
                            <IconButton
                                onClick={() => setIsCalendarOpen((prev) => !prev)}
                                color={isCalendarOpen ? "success" : "secondary"}
                            >
                                <CalendarMonth />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {!selectedOfficeRoom && (
                    <Box sx={{ overflowX: "auto", whiteSpace: "nowrap" }}>
                        <Tabs
                            value={1}
                            variant="scrollable"
                            scrollButtons="auto"
                            TabIndicatorProps={{ style: { display: "none" } }}
                            sx={{
                                "& .MuiTabs-scrollButtons": {
                                    width: "auto",
                                },
                                "& > div > .MuiTabs-flexContainer": {
                                    justifyContent: "center",
                                },
                                mb: 2,
                            }}
                        >
                            {selectedOffice === null &&
                                officesOptions.map((o) => (
                                    <TabChip
                                        label={o.label}
                                        key={o.value}
                                        onClick={() => setSelectedOfficeFromId(o.value)}
                                    />
                                ))}
                            {selectedOfficeFloor === null &&
                                officeFloorsOptions.map((o) => (
                                    <TabChip
                                        label={o.label}
                                        key={o.value}
                                        onClick={() => setSelectedOfficeFloorFromId(o.value)}
                                    />
                                ))}

                            {reservableRoomsOptions.map((o) => (
                                <TabChip
                                    label={o.label}
                                    key={o.value}
                                    onClick={() => setSelectedOfficeRoomFromId(o.value)}
                                />
                            ))}
                        </Tabs>
                    </Box>
                )}
                {/* {!selectedOfficeRoom && (
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
                    ></Box>
                )} */}
                {!isCalendarOpen && (
                    <>
                        {selectedOffice && !selectedOfficeRoom && (
                            <Box sx={{ display: "flex", mb: 2, justifyContent: "center", gap: 2 }}>
                                <TextField
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    label="Rechercher une salle"
                                    size="small"
                                    sx={{ width: 250 }}
                                />
                                <UserSelect
                                    setSelectedUserFromId={setSelectedUserFromId}
                                    selectedUserOption={selectedUserOption}
                                    usersOptions={usersOptions}
                                />
                            </Box>
                        )}
                        {selectedOffice && selectedOfficeFloor && !selectedOfficeRoom && (
                            <ShowOfficeFloor
                                selectedOffice={selectedOffice}
                                selectedOfficeFloor={selectedOfficeFloor}
                                rooms={officeRooms}
                                selectedRoom={selectedOfficeRoom}
                                searchText={searchText}
                                numberOfFloors={1}
                                offsetHeight={isMediumScreen ? 0 : 450}
                                reservations={reservations}
                                searchedUser={selectedUser}
                            />
                        )}
                    </>
                )}
                {selectedOffice && selectedOfficeFloor && selectedOfficeRoom && (
                    <OfficeRoomCalendar
                        step={15}
                        officeRooms={[selectedOfficeRoom]}
                        officeId={selectedOffice.id}
                        officeFloorId={selectedOfficeFloor.id}
                        officeFloors={officeFloors}
                        isSingleRoom
                    />
                )}
                {!isCalendarOpen && selectedOffice && !selectedOfficeFloor && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMediumScreen ? "column" : undefined,
                            gap: 2,
                            bgcolor: "background.default",
                            pb: 2,
                        }}
                    >
                        {officeFloors.map((officeFloor) => (
                            <ShowOfficeFloor
                                key={officeFloor.id}
                                selectedOffice={selectedOffice}
                                selectedOfficeFloor={officeFloor}
                                rooms={nonFilteredOfficeRooms}
                                selectedRoom={selectedOfficeRoom}
                                numberOfFloors={isMediumScreen ? 1 : officeFloors.length}
                                searchText={searchText}
                                reservations={reservations}
                                searchedUser={selectedUser}
                            />
                        ))}
                    </Box>
                )}
                {isCalendarOpen && !selectedOfficeRoom && selectedOffice?.id && (
                    <OfficeRoomCalendar
                        step={15}
                        officeRooms={nonFilteredOfficeRooms}
                        officeId={selectedOffice.id}
                        officeFloorId={selectedOfficeFloor?.id ?? null}
                        officeFloors={officeFloors}
                    />
                )}
            </Box>
        </MainLayout>
    );
};

export default OfficeRoomsPage;
