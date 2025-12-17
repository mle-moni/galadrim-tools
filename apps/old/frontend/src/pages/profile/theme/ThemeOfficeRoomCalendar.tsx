import { useMemo } from "react";
import { RenouvArtWait } from "../../../reusableComponents/animations/RenouvArtWait/RenouvArtWait";
import { OfficeRoomCalendar } from "../../office-rooms/calendar/OfficeRoomCalendar";
import { useOfficeFloorSelect } from "../../office-rooms/useOfficeFloorSelect";
import { useOfficeRoomSelect } from "../../office-rooms/useOfficeRoomSelect";
import { useOfficeSelect } from "../../office-rooms/useOfficeSelect";

export const ThemeOfficeRoomCalendar = () => {
    const { allOffices } = useOfficeSelect();
    const { allOfficeFloors } = useOfficeFloorSelect(null);
    const { allOfficeRooms } = useOfficeRoomSelect(null);
    const autoSelectedOffice = useMemo(() => allOffices.at(0) ?? null, [allOffices]);
    const filteredOfficeFloors = useMemo(
        () => allOfficeFloors.filter(({ officeId }) => officeId === autoSelectedOffice?.id),
        [autoSelectedOffice, allOfficeFloors],
    );

    if (!autoSelectedOffice) {
        return <RenouvArtWait />;
    }

    return (
        <OfficeRoomCalendar
            step={15}
            officeRooms={allOfficeRooms}
            officeId={autoSelectedOffice.id}
            officeFloorId={null}
            officeFloors={filteredOfficeFloors}
        />
    );
};
