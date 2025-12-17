import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { observer } from "mobx-react-lite";
import moment from "moment";
import "moment/locale/es";
import { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppStore } from "../../../globalStores/AppStore";
import { getStartOfDay } from "../getStartOfDay";
import { ResourceHeader } from "./ResourceHeader";
import { MomentFrLocales } from "./setFrLocales";
import { useOfficeRoomCalendar } from "./useOfficeRoomCalendar";

export type OfficeRoomEvent = {
    id: number;
    start: Date;
    end: Date;
    title: string;
    officeRoomId: number;
    userId: number;
};

moment.locale("fr", MomentFrLocales);

const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop<OfficeRoomEvent, ApiOfficeRoom>(Calendar);

export type CalendarDateRange = [Date] | [Date, Date, Date, Date, Date];

export const OfficeRoomCalendar = observer<{
    step: number;
    height?: string | number;
    officeFloors: ApiOfficeFloor[];
    officeRooms: ApiOfficeRoom[];
    officeId: number;
    officeFloorId: number | null;
    isSingleRoom?: boolean;
    showOnlyAvailable?: boolean;
}>(
    ({
        step,
        height,
        officeRooms: rooms,
        officeId,
        officeFloorId,
        officeFloors,
        isSingleRoom = false,
        showOnlyAvailable = false,
    }) => {
        const officeFloorsMap = useMemo(
            () => new Map(officeFloors.map((f) => [f.id, f])),
            [officeFloors],
        );
        const officeRoomsFiltered = useMemo(() => {
            const finalSet = officeFloorId ? new Set([officeFloorId]) : officeFloorsMap;

            return rooms.filter((r) => finalSet.has(r.officeFloorId) && r.isBookable);
        }, [rooms, officeFloorId, officeFloorsMap]);

        const officeFloorsList = useMemo(
            () =>
                officeFloors
                    .reduce((acc, f) => {
                        if (!acc.includes(f.floor)) {
                            acc.push(f.floor);
                        }
                        return acc;
                    }, [] as number[])
                    .sort((a, b) => a - b),
            [officeFloors],
        );

        const officeRoomsSorted = useMemo(
            () =>
                officeRoomsFiltered.slice().sort((a, b) => {
                    const aFloor = officeFloorsMap.get(a.officeFloorId)?.floor ?? 0;
                    const bFloor = officeFloorsMap.get(b.officeFloorId)?.floor ?? 0;

                    return aFloor - bFloor;
                }),
            [officeRoomsFiltered, officeFloorsMap],
        );

        const [range, setRange] = useState<CalendarDateRange>([getStartOfDay()]);
        const handleRangeChange = (newRange: Date[] | null) => {
            if (!newRange) return;
            setRange(newRange as CalendarDateRange);
        };

        const {
            reservationsQuery,
            createReservationMutation,
            deleteReservationMutation,
            updateReservationMutation,
        } = useOfficeRoomCalendar(officeId, range);
        const events: OfficeRoomEvent[] = useMemo(
            () =>
                (reservationsQuery.data ?? []).map((e) => ({
                    ...e,
                    createdAt: new Date(e.createdAt),
                    updatedAt: new Date(e.updatedAt),
                    start: new Date(e.start),
                    end: new Date(e.end),
                    title: e.titleComputed,
                })),
            [reservationsQuery.data],
        );

        const nonAvailableRoomsSet = useMemo(() => {
            const now = new Date();
            const eventsNow = events.filter((e) => e.start < now && now < e.end);

            return new Set(eventsNow.map((e) => e.officeRoomId));
        }, [events]);

        const officeRooms = useMemo(() => {
            if (showOnlyAvailable) {
                return officeRoomsSorted.filter((r) => !nonAvailableRoomsSet.has(r.id));
            }
            return officeRoomsSorted;
        }, [officeRoomsSorted, nonAvailableRoomsSet, showOnlyAvailable]);

        return (
            <div
                style={{
                    height: height ?? "100%",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "var(--main-color)",
                }}
            >
                <div
                    style={{
                        width: "90vw",
                        backgroundColor: "white",
                        maxHeight: isSingleRoom ? "100%" : "calc(100vh - 250px)",
                    }}
                >
                    <DragAndDropCalendar
                        selectable
                        min={new Date(0, 0, 0, 9, 0, 0)}
                        max={new Date(0, 0, 0, 19, 30, 0)}
                        step={step}
                        resizableAccessor={() => false}
                        localizer={localizer}
                        events={events}
                        eventPropGetter={(e) => {
                            const className =
                                AppStore.authStore.user.id === e.userId ? "mine" : "others";

                            return { className };
                        }}
                        onRangeChange={(e) => handleRangeChange(Array.isArray(e) ? e : null)}
                        defaultDate={range[0]}
                        defaultView="day"
                        views={["day", "work_week"]}
                        messages={{
                            work_week: "semaine",
                            day: "jour",
                            today: "aujourd'hui",
                            next: "suivant",
                            previous: "précédent",
                        }}
                        onEventDrop={(opts) => {
                            updateReservationMutation.mutate(opts);
                        }}
                        onSelectSlot={({ start, end, resourceId }) => {
                            if (!resourceId) return;
                            createReservationMutation.mutate({
                                start,
                                end,
                                officeRoomId: +resourceId,
                            });
                        }}
                        onDoubleClickEvent={({ id }) => deleteReservationMutation.mutate(id)}
                        resources={officeRooms}
                        resourceIdAccessor="id"
                        resourceTitleAccessor="name"
                        titleAccessor={"title"}
                        resourceAccessor="officeRoomId"
                        components={{
                            resourceHeader: (props) => (
                                <ResourceHeader
                                    {...props}
                                    officeFloorsMap={officeFloorsMap}
                                    officeFloorsList={officeFloorsList}
                                />
                            ),
                        }}
                    />
                </div>
            </div>
        );
    },
);
