// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SchedulerRoomColumn from "./SchedulerRoomColumn";
import type { Reservation } from "./types";
import { useSchedulerInteractions } from "./useSchedulerInteractions";

const PIXELS_PER_HOUR = 60;
const currentDate = new Date(2026, 9, 5);

function renderColumn(events: Parameters<typeof SchedulerRoomColumn>[0]["events"] = []) {
    const onAddReservation = vi.fn();
    let column: HTMLDivElement | null = null;

    function Harness() {
        const interactions = useSchedulerInteractions({
            currentDate,
            pixelsPerHour: PIXELS_PER_HOUR,
            gridHeight: 660,
            intervalMinutes: 15,
            getRoomColumnElement: () => column,
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
                touchHandlers={interactions.getTouchHandlers(7)}
                setRoomColumnRef={vi.fn()}
                dragSelection={interactions.dragSelection}
                intervalMinutes={15}
                showCurrentLine={false}
                currentLineTop={0}
            />
        );
    }

    const { container } = render(<Harness />);
    column = container.querySelector("#room-col-7") as HTMLDivElement;
    column.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    return { column, container, onAddReservation };
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

const touch = (clientY: number, pointerId = 1) => ({
    pointerType: "touch",
    pointerId,
    isPrimary: pointerId === 1,
    clientX: 20,
    clientY,
});

const tap = (el: Element, clientY: number) => {
    fireEvent.pointerDown(el, touch(clientY));
    fireEvent.pointerUp(el, touch(clientY));
    fireEvent.click(el, { clientY });
};

const longPress = (el: Element, clientY: number) => {
    fireEvent.pointerDown(el, touch(clientY));
    act(() => {
        vi.advanceTimersByTime(400);
    });
};

const at = (h: number, m: number) => new Date(2026, 9, 5, h, m);

describe("touch on the room grid", () => {
    it("books 30 minutes from the tapped slot", () => {
        const { column, onAddReservation } = renderColumn();

        // 9:00 is the top of the grid, so y=450 at 60px/h is 16:30.
        tap(column, 450);

        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(16, 30),
            endTime: at(17, 0),
        });
    });

    it("clamps the end to closing time", () => {
        const { column, onAddReservation } = renderColumn();

        tap(column, 645);

        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(19, 45),
            endTime: at(20, 0),
        });
    });

    it("ignores mouse pointers, which keep drag-to-select", () => {
        const { column, onAddReservation } = renderColumn();

        fireEvent.pointerDown(column, { pointerType: "mouse", clientY: 450 });
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
        tap(block, 450);

        expect(onAddReservation).not.toHaveBeenCalled();
    });

    it("drags a range after a long press", () => {
        vi.useFakeTimers();
        const { column, onAddReservation } = renderColumn();

        longPress(column, 450);
        fireEvent.pointerMove(column, touch(570));
        fireEvent.pointerUp(column, touch(570));

        expect(onAddReservation).toHaveBeenCalledTimes(1);
        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(16, 30),
            endTime: at(18, 30),
        });
    });

    it("drags upwards after a long press", () => {
        vi.useFakeTimers();
        const { column, onAddReservation } = renderColumn();

        longPress(column, 450);
        fireEvent.pointerMove(column, touch(360));
        fireEvent.pointerUp(column, touch(360));

        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(15, 0),
            endTime: at(16, 30),
        });
    });

    it("books nothing when the finger moves before the long press (a scroll)", () => {
        vi.useFakeTimers();
        const { column, onAddReservation } = renderColumn();

        fireEvent.pointerDown(column, touch(450));
        fireEvent.pointerMove(column, touch(480));
        act(() => {
            vi.advanceTimersByTime(400);
        });
        fireEvent.pointerUp(column, touch(480));

        expect(onAddReservation).not.toHaveBeenCalled();
    });

    it("books nothing when the browser cancels the touch mid-selection", () => {
        vi.useFakeTimers();
        const { column, onAddReservation } = renderColumn();

        longPress(column, 450);
        fireEvent.pointerMove(column, touch(570));
        fireEvent.pointerCancel(column, touch(570));
        fireEvent.pointerUp(column, touch(570));

        expect(onAddReservation).not.toHaveBeenCalled();
    });

    it("books nothing for a touch that only stops a scroll fling (no click follows)", () => {
        const { column, onAddReservation } = renderColumn();

        fireEvent.pointerDown(column, touch(450));
        fireEvent.pointerUp(column, touch(450));
        fireEvent.pointerDown(column, { pointerType: "mouse", pointerId: 9, isPrimary: true });
        fireEvent.click(column);

        expect(onAddReservation).not.toHaveBeenCalled();
    });

    it("ignores a second finger during a long-press drag", () => {
        vi.useFakeTimers();
        const { column, onAddReservation } = renderColumn();

        longPress(column, 450);
        fireEvent.pointerDown(column, touch(100, 2));
        act(() => {
            vi.advanceTimersByTime(400);
        });
        fireEvent.pointerMove(column, touch(570));
        fireEvent.pointerMove(column, touch(100, 2));
        fireEvent.pointerUp(column, touch(100, 2));
        fireEvent.pointerUp(column, touch(570));

        expect(onAddReservation).toHaveBeenCalledTimes(1);
        expect(onAddReservation).toHaveBeenCalledWith({
            roomId: 7,
            startTime: at(16, 30),
            endTime: at(18, 30),
        });
    });
});
