import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

import { Label } from "@/components/ui/label";

const selectClassName =
    "border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]";

export function SelectRow(props: {
    offices: ApiOffice[];
    floors: ApiOfficeFloor[];
    rooms: ApiOfficeRoom[];
    selectedOfficeId: number | null;
    selectedFloorId: number | null;
    selectedRoomId: number | null;
    onOfficeChange: (id: number | null) => void;
    onFloorChange: (id: number | null) => void;
    onRoomChange: (id: number | null) => void;
}) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
                <Label htmlFor="admin-map-office">Bureau</Label>
                <select
                    id="admin-map-office"
                    className={selectClassName}
                    value={props.selectedOfficeId ?? ""}
                    onChange={(e) => {
                        props.onOfficeChange(e.target.value === "" ? null : Number(e.target.value));
                    }}
                >
                    <option value="" disabled>
                        Sélectionner…
                    </option>
                    {props.offices
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="admin-map-floor">Étage</Label>
                <select
                    id="admin-map-floor"
                    className={selectClassName}
                    value={props.selectedFloorId ?? ""}
                    disabled={props.selectedOfficeId == null}
                    onChange={(e) => {
                        props.onFloorChange(e.target.value === "" ? null : Number(e.target.value));
                    }}
                >
                    <option value="" disabled>
                        Sélectionner…
                    </option>
                    {props.floors
                        .slice()
                        .sort((a, b) => a.floor - b.floor)
                        .map((f) => (
                            <option key={f.id} value={f.id}>
                                {`Étage ${f.floor}`}
                            </option>
                        ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="admin-map-room">Salle</Label>
                <select
                    id="admin-map-room"
                    className={selectClassName}
                    value={props.selectedRoomId ?? ""}
                    disabled={props.selectedFloorId == null}
                    onChange={(e) => {
                        props.onRoomChange(e.target.value === "" ? null : Number(e.target.value));
                    }}
                >
                    <option value="">Aucune</option>
                    {props.rooms
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                </select>
            </div>
        </div>
    );
}
