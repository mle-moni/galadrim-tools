// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SchedulerRoomColumn from "./SchedulerRoomColumn";
import type { Reservation } from "./types";
import { useSchedulerInteractions } from "./useSchedulerInteractions";

const PIXELS_PER_HOUR = 60;
const currentDate = new Date(2026, 9, 5);

function renderColumn(events: Parameters<typeof SchedulerRoomColumn>[0]["events"] = []) {
    const onAddReservation = vi.fn();

    function Harness() {
        const interactions = useSchedulerInteractions({
            currentDate,
            pixelsPerHour: PIXELS_PER_HOUR,
            gridHeight: 660,
            intervalMinutes: 15,
            getRoomColumnElement: () => null,
            onAddReservation,
            onUpdateReservation: vi.fn(),
        });
        return (
            <SchedulerRoomColumn
                room={{ id: 7 } as Parameters<typeof SchedulerRoomColumn>[0]["room"]}
                gridHeight={660}
                pixelsPerHour={PIXELS_PER_HOUR}
                hourIntervals={[]}
                events={events}
                selectedEventId={null}
                onSelectEventId={vi.fn()}
                onDeleteReservation={vi.fn()}
                onDragStartEvent={vi.fn()}
                onMouseDown={(e) => interactions.handleMouseDownOnGrid(e, 7)}
                onMouseEnter={vi.fn()}
                onPointerUp={(e) => interactions.handleTapOnGrid(e, 7)}
                setRoomColumnRef={vi.fn()}
                dragSelection={interactions.dragSelection}
                intervalMinutes={15}
                showCurrentLine={false}
                currentLineTop={0}
            />
        );
    }

    const { container } = render(<Harness />);
    const column = container.querySelector("#room-col-7") as HTMLDivElement;
    column.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    return { column, container, onAddReservation };
}

afterEach(cleanup);

const at = (h: number, m: number) => new Date(2026, 9, 5, h, m);

describe("touch tap on the room grid", () => {
    it("books 30 minutes from the tapped slot", () => {
        const { column, onAddReservation } = renderColumn();

        // 9:00 is the top of the grid, so y=450 at 60px/h is 16:30.
        fireEvent.pointerUp(column, { pointerType: "touch", clientY: 450 });

        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(16, 30),
            endTime: at(17, 0),
        });
    });

    it("clamps the end to closing time", () => {
        const { column, onAddReservation } = renderColumn();

        fireEvent.pointerUp(column, { pointerType: "touch", clientY: 645 });

        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(19, 45),
            endTime: at(20, 0),
        });
    });

    it("ignores mouse pointers, which keep drag-to-select", () => {
        const { column, onAddReservation } = renderColumn();

        fireEvent.pointerUp(column, { pointerType: "mouse", clientY: 450 });

        expect(onAddReservation).not.toHaveBeenCalled();
    });

    it("ignores taps on an existing reservation", () => {
        const event = {
            id: 1,
            roomId: 7,
            startTime: at(16, 0),
            endTime: at(17, 0),
            owner: "x",
            canEdit: true,
            top: 420,
            height: 60,
            left: 0,
            width: 100,
        } as unknown as Reservation;
        const { container, onAddReservation } = renderColumn([
            event as Parameters<typeof SchedulerRoomColumn>[0]["events"][number],
        ]);

        const block = container.querySelector("#room-col-7 > div.absolute.flex") as HTMLElement;
        fireEvent.pointerUp(block, { pointerType: "touch", clientY: 450 });

        expect(onAddReservation).not.toHaveBeenCalled();
    });
});
