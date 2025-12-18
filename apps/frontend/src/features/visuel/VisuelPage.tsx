import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, Map as MapIcon } from "lucide-react";

import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { startOfDayIso } from "@/integrations/backend/date";
import {
    officeFloorsQueryOptions,
    officeRoomsQueryOptions,
    officesQueryOptions,
} from "@/integrations/backend/offices";
import { roomReservationsQueryOptions } from "@/integrations/backend/reservations";

import OfficeFloorCanvas from "./components/OfficeFloorCanvas";
import { formatFloorLabel, formatFloorShort } from "./utils/floors";

const FLOOR_ROW_HEIGHT = 380;
const OVERSCAN_ROWS = 2;

export default function VisuelPage(props: {
    initialOfficeId?: number;
    initialFloorId?: number;
}) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const officesQuery = useQuery(officesQueryOptions());
    const officeFloorsQuery = useQuery(officeFloorsQueryOptions());
    const officeRoomsQuery = useQuery(officeRoomsQueryOptions());

    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

    useEffect(() => {
        if (!officesQuery.data) return;
        const availableOfficeIds = new Set(officesQuery.data.map((o) => o.id));

        if (props.initialOfficeId && availableOfficeIds.has(props.initialOfficeId)) {
            setSelectedOfficeId(props.initialOfficeId);
            return;
        }

        if (selectedOfficeId !== null) return;

        const firstOfficeId = officesQuery.data[0]?.id ?? null;
        if (firstOfficeId !== null) setSelectedOfficeId(firstOfficeId);
    }, [officesQuery.data, props.initialOfficeId, selectedOfficeId]);

    useEffect(() => {
        if (!officeFloorsQuery.data) return;

        if (props.initialFloorId === undefined) {
            setSelectedFloorId(null);
            return;
        }

        const floorsById = new Set(officeFloorsQuery.data.map((f) => f.id));
        setSelectedFloorId(floorsById.has(props.initialFloorId) ? props.initialFloorId : null);
    }, [officeFloorsQuery.data, props.initialFloorId]);

    const selectedOfficeName = useMemo(() => {
        if (!officesQuery.data) return undefined;
        if (selectedOfficeId === null) return undefined;
        return officesQuery.data.find((o) => o.id === selectedOfficeId)?.name;
    }, [officesQuery.data, selectedOfficeId]);

    const officeFloorsForOffice = useMemo(() => {
        if (!officeFloorsQuery.data) return [];
        if (selectedOfficeId === null) return [];

        return officeFloorsQuery.data
            .filter((f) => f.officeId === selectedOfficeId)
            .slice()
            .sort((a, b) => a.floor - b.floor);
    }, [officeFloorsQuery.data, selectedOfficeId]);

    const visibleFloors = useMemo(() => {
        if (selectedFloorId === null) return officeFloorsForOffice;
        return officeFloorsForOffice.filter((f) => f.id === selectedFloorId);
    }, [officeFloorsForOffice, selectedFloorId]);

    const dayIso = useMemo(() => startOfDayIso(new Date()), []);
    const officeIdForQueries = selectedOfficeId ?? 0;

    const reservationsQuery = useQuery({
        ...roomReservationsQueryOptions(officeIdForQueries, dayIso),
        enabled: selectedOfficeId !== null,
    });

    const roomsByFloorId = useMemo(() => {
        const map = new Map<number, ApiOfficeRoom[]>();
        const rooms = officeRoomsQuery.data ?? [];
        for (const room of rooms) {
            const list = map.get(room.officeFloorId) ?? [];
            list.push(room);
            map.set(room.officeFloorId, list);
        }

        for (const [, list] of map) {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }

        return map;
    }, [officeRoomsQuery.data]);

    const officeById = useMemo(() => {
        return new Map((officesQuery.data ?? []).map((o) => [o.id, o]));
    }, [officesQuery.data]);

    const floorsById = useMemo(() => {
        return new Map((officeFloorsQuery.data ?? []).map((f) => [f.id, f]));
    }, [officeFloorsQuery.data]);

    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const update = () => {
            setScrollTop(el.scrollTop);
            setViewportHeight(el.clientHeight);
        };

        update();
        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    const totalHeight = visibleFloors.length * FLOOR_ROW_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / FLOOR_ROW_HEIGHT) - OVERSCAN_ROWS);
    const endIndex = Math.min(
        visibleFloors.length,
        Math.ceil((scrollTop + viewportHeight) / FLOOR_ROW_HEIGHT) + OVERSCAN_ROWS,
    );

    const topSpacer = startIndex * FLOOR_ROW_HEIGHT;
    const bottomSpacer = Math.max(0, totalHeight - endIndex * FLOOR_ROW_HEIGHT);

    const floorTabs: { id: number | null; label: string }[] = useMemo(() => {
        const base: { id: number | null; label: string }[] = [{ id: null, label: "Tous" }];
        for (const floor of officeFloorsForOffice) {
            base.push({ id: floor.id, label: formatFloorLabel(floor.floor) });
        }
        return base;
    }, [officeFloorsForOffice]);

    const currentSearch = useMemo(() => {
        return {
            officeId: selectedOfficeId ?? undefined,
            floorId: selectedFloorId ?? undefined,
        };
    }, [selectedOfficeId, selectedFloorId]);

    const planningSearch = useMemo(() => {
        return {
            officeId: selectedOfficeId ?? undefined,
            floorId: selectedFloorId ?? undefined,
            roomId: undefined,
        };
    }, [selectedOfficeId, selectedFloorId]);

    const handleRoomClick = (room: ApiOfficeRoom) => {
        const floor = floorsById.get(room.officeFloorId);
        const officeId = floor?.officeId;
        if (!officeId) return;

        const params = new URLSearchParams();
        params.set("officeId", String(officeId));
        params.set("floorId", String(room.officeFloorId));
        params.set("roomId", String(room.id));

        router.history.push(`/planning?${params.toString()}`);
    };

    const headerOffice = officeById.get(selectedOfficeId ?? -1);

    return (
        <div className="flex h-full min-h-0 flex-col bg-background">
            <header className="border-b bg-background px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold tracking-tight">Salles de réunions</h1>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <div className="flex items-center rounded-md border bg-card p-1">
                            <Button asChild size="sm" variant="ghost" className="h-8">
                                <Link to="/planning" search={planningSearch}>
                                    <CalendarDays className="h-4 w-4" />
                                    Planning
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="secondary" className="h-8">
                                <Link to="/visuel" search={currentSearch}>
                                    <MapIcon className="h-4 w-4" />
                                    Visuel
                                </Link>
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2" type="button">
                                    <Building2 className="h-4 w-4" />
                                    {selectedOfficeName ?? "Chargement…"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {(officesQuery.data ?? []).map((office: ApiOffice) => (
                                    <DropdownMenuItem key={office.id} asChild>
                                        <Link
                                            to="/visuel"
                                            search={{
                                                officeId: office.id,
                                                floorId: undefined,
                                            }}
                                        >
                                            {office.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                        {floorTabs.map((tab) => {
                            const isActive = tab.id === selectedFloorId;
                            return (
                                <Button
                                    key={tab.label}
                                    asChild
                                    type="button"
                                    size="sm"
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("h-8", !isActive && "text-muted-foreground")}
                                >
                                    <Link
                                        to="/visuel"
                                        search={{
                                            officeId: selectedOfficeId ?? undefined,
                                            floorId: tab.id ?? undefined,
                                        }}
                                    >
                                        {tab.label}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>

                    <div className="ml-auto text-sm text-muted-foreground">
                        {headerOffice ? headerOffice.address : null}
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <div style={{ height: topSpacer }} />

                {visibleFloors.slice(startIndex, endIndex).map((floor: ApiOfficeFloor, idx) => {
                    const rooms = roomsByFloorId.get(floor.id) ?? [];
                    const visibleIndex = startIndex + idx;
                    const isDimmed = selectedFloorId !== null && floor.id !== selectedFloorId;

                    return (
                        <section
                            key={floor.id}
                            className={cn("border-b", "bg-black", isDimmed && "opacity-60")}
                            style={{ height: FLOOR_ROW_HEIGHT }}
                        >
                            <div className="flex h-full items-center gap-6 px-6 py-6">
                                <div className="flex w-32 flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" className="w-fit">
                                            {`Étage ${floor.floor}`}
                                        </Button>
                                    </div>
                                    <div className="text-xs text-white/60">
                                        {formatFloorShort(floor.floor)} · {rooms.length} salles
                                    </div>
                                </div>

                                <div className="ml-auto">
                                    <OfficeFloorCanvas
                                        key={`${floor.id}-${visibleIndex}`}
                                        rooms={rooms.filter((r) => r.isBookable && !r.isPhonebox)}
                                        reservations={reservationsQuery.data ?? []}
                                        onRoomClick={handleRoomClick}
                                    />
                                </div>
                            </div>
                        </section>
                    );
                })}

                <div style={{ height: bottomSpacer }} />
            </div>
        </div>
    );
}
