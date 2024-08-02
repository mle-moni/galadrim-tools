import { observer } from "mobx-react-lite";
import moment from "moment";
import "moment/locale/es";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppStore } from "../../globalStores/AppStore";
import type { RoomEvent } from "../../globalStores/EventsStore";
import { AllRooms, NantesRooms, BonneNouvelleRooms, SaintPaulRooms, type WorkspaceLocation } from "../../utils/rooms";
import { MomentFrLocales } from "./setFrLocales";

moment.locale("fr", MomentFrLocales);

const localizer = momentLocalizer(moment);

type CalendarEvent = RoomEvent & { resourceId: string };

const DragAndDropCalendar = withDragAndDrop<
    CalendarEvent,
    {
        name: (typeof AllRooms)[number]["name"];
    }
>(Calendar);

const getCalendarEventFromRoomEvent = (roomEvents: RoomEvent[]): CalendarEvent[] => {
    return roomEvents.map((event) => ({
        ...event,
        resourceId: event.room,
    }));
};

const CALENDAR_POSITION = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 120,
} as const;

export const RoomCalendar = observer<{
    step: number;
    location?: WorkspaceLocation;
    height?: string | number;
    isAbsolute?: boolean;
}>(({ step, location = "saintPaul", height, isAbsolute = true }) => (
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
                events={getCalendarEventFromRoomEvent(AppStore.eventsStore.roomEvents)}
                eventPropGetter={(e) => {
                    const className = AppStore.authStore.user.id === e.userId ? "mine" : "others";

                    return { className };
                }}
                defaultDate={new Date()}
                defaultView="day"
                views={["day", "work_week"]}
                messages={{
                    work_week: "semaine",
                    day: "jour",
                    today: "aujourd'hui",
                    next: "suivant",
                    previous: "précédent",
                }}
                onEventDrop={(args) => {
                    AppStore.eventsStore.onEventDrop(args);
                }}
                onSelectSlot={({ start, end, resourceId }) => {
                    AppStore.eventsStore.newEvent(new Date(start), new Date(end), resourceId?.toString() ?? null);
                }}
                onDoubleClickEvent={(args) => AppStore.eventsStore.onDoubleClickEvent(args)}
                {...(AppStore.eventsStore.roomName === "*" && {
                    resources: AllRooms.filter(({ name }) => {
                        const rooms = location === "nantes" ? NantesRooms : SaintPaulRooms;
                        return Object.values(rooms).some((room) => room.name === name);
                    }),
                    resourceIdAccessor: "name",
                    resourceTitleAccessor: "name",
                })}
            />
        </div>
    </div>
));
