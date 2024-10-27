import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { observer } from "mobx-react-lite";
import moment from "moment";
import "moment/locale/es";
import { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppStore } from "../../../globalStores/AppStore";
import { MomentFrLocales } from "../../room/setFrLocales";
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

const CALENDAR_POSITION = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 120,
} as const;

export type CalendarDateRange = [Date] | [Date, Date, Date, Date, Date];

export const OfficeRoomCalendar = observer<{
    step: number;
    height?: string | number;
    isAbsolute?: boolean;
    officeFloors: ApiOfficeFloor[];
    officeRooms: ApiOfficeRoom[];
    officeId: number;
    officeFloorId: number | null;
}>(
    ({
        step,
        height,
        isAbsolute = true,
        officeRooms: rooms,
        officeId,
        officeFloorId,
        officeFloors,
    }) => {
        const officeRooms = useMemo(() => {
            const allFloorsSet = new Set(officeFloors.map((f) => f.id));
            const finalSet = officeFloorId ? new Set([officeFloorId]) : allFloorsSet;

            return rooms.filter((r) => finalSet.has(r.officeFloorId) && r.isBookable);
        }, [rooms, officeFloorId, officeFloors]);
        const [range, setRange] = useState<CalendarDateRange>([new Date()]);
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
        const events: OfficeRoomEvent[] = useMemo(() => {
            const rawData = reservationsQuery.data ?? [];

            return rawData.map((e) => ({
                ...e,
                createdAt: new Date(e.createdAt),
                updatedAt: new Date(e.updatedAt),
                start: new Date(e.start),
                end: new Date(e.end),
                title: e.titleComputed,
            }));
        }, [reservationsQuery.data]);

        return (
            <div
                style={{
                    height: height ?? "100%",
                    display: "flex",
                    justifyContent: "center",
                    ...(isAbsolute ? CALENDAR_POSITION : {}),
                    backgroundColor: "var(--main-color)",
                }}
            >
                <div style={{ width: "90vw", backgroundColor: "white" }}>
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
                    />
                </div>
            </div>
        );
    },
);
