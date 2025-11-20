import { CalendarMonth, EventBusy, Home } from "@mui/icons-material";
import { Box, Breadcrumbs, IconButton, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIsMediumScreen, useIsMobile } from "../../hooks/useIsMobile";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { ShowOfficeFloor } from "./ShowOfficeFloor";
import { TabChip } from "./TabChip";
import { UserSelect } from "./UserSelect";
import { type CalendarDateRange, OfficeRoomCalendar } from "./calendar/OfficeRoomCalendar";
import { useOfficeRoomCalendar } from "./calendar/useOfficeRoomCalendar";
import { getStartOfDay } from "./getStartOfDay";
import { useOfficeFloorSelect } from "./useOfficeFloorSelect";
import { useOfficeRoomSelect } from "./useOfficeRoomSelect";
import { useOfficeSelect } from "./useOfficeSelect";
import { useUserSelect } from "./useUserSelect";
import { useQueryState, parseAsBoolean } from "nuqs";

const LINK_STYLE: CSSProperties = { color: "black", textDecoration: "none", fontSize: 26 };

export const OfficeRoomsPage = () => {
    const { officesOptions, selectedOffice, setSelectedOfficeFromId } = useOfficeSelect();
    const { officeFloors, officeFloorsOptions, selectedOfficeFloor, setSelectedOfficeFloorFromId } =
        useOfficeFloorSelect(selectedOffice);
    const { officeRooms, selectedOfficeRoom, setSelectedOfficeRoomFromId, allOfficeRooms } =
        useOfficeRoomSelect(selectedOfficeFloor);
    const reservableRooms = useMemo(() => officeRooms.filter((r) => r.isBookable), [officeRooms]);
    const reservableRoomsOptions = useMemo(() => {
        return reservableRooms.map((r) => ({
            label: r.name,
            value: r.id,
        }));
    }, [reservableRooms]);
    const calendarOptions = useMemo<[number | null, CalendarDateRange]>(
        () => [selectedOffice?.id ?? null, [getStartOfDay()]],
        [selectedOffice],
    );
    const { reservationsQuery } = useOfficeRoomCalendar(calendarOptions[0], calendarOptions[1]);
    const reservations = useMemo(() => reservationsQuery.data ?? [], [reservationsQuery.data]);

    const isMediumScreen = useIsMediumScreen();
    const [searchText, setSearchText] = useState("");
    const { selectedUser, setSelectedUserFromId, usersOptions, selectedUserOption } =
        useUserSelect();
    const isMobile = useIsMobile();

    const [isCalendarOpen, setIsCalendarOpen] = useQueryState(
        "calendar",
        parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
    );
    const [showOnlyAvailable, setShowOnlyAvailable] = useQueryState(
        "onlyAvailable",
        parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
    );

    useEffect(() => {
        if (selectedOfficeFloor) return;

        if (officeFloorsOptions.length === 1) {
            setSelectedOfficeFloorFromId(officeFloorsOptions[0].value);
        }
    }, [officeFloorsOptions, selectedOfficeFloor, setSelectedOfficeFloorFromId]);

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
                        <Box>
                            <Tooltip title="Voir le Calendrier">
                                <IconButton
                                    onClick={() => setIsCalendarOpen((prev) => !prev)}
                                    color={isCalendarOpen ? "success" : "secondary"}
                                >
                                    <CalendarMonth />
                                </IconButton>
                            </Tooltip>
                            {isCalendarOpen && (
                                <Tooltip title="Ne montrer que les salles disponibles">
                                    <IconButton
                                        onClick={() => setShowOnlyAvailable((prev) => !prev)}
                                        color={showOnlyAvailable ? "error" : "secondary"}
                                    >
                                        <EventBusy />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
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
                        showOnlyAvailable={showOnlyAvailable}
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
                                rooms={allOfficeRooms}
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
                        officeRooms={allOfficeRooms}
                        officeId={selectedOffice.id}
                        officeFloorId={selectedOfficeFloor?.id ?? null}
                        officeFloors={officeFloors}
                        showOnlyAvailable={showOnlyAvailable}
                    />
                )}
            </Box>
        </MainLayout>
    );
};

export default OfficeRoomsPage;
