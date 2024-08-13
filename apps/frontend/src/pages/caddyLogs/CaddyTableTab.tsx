import "./tableOverrides.css";

import {
    type MRT_ColumnDef,
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import { observer } from "mobx-react-lite";
import { HTTP_METHODS_OPTIONS } from "../../api/fetch";
import type { CaddyLog, CaddyLogsStore } from "./CaddyLogsStore";

const columns: MRT_ColumnDef<CaddyLog>[] = [
    {
        accessorKey: "ts",
        header: "Timestamp",
        size: 25,
    },
    {
        accessorKey: "request.method",
        header: "Methode",
        filterVariant: "select",
        filterSelectOptions: HTTP_METHODS_OPTIONS,
        size: 25,
    },
    {
        accessorKey: "request.host",
        header: "Host",
        size: 25,
    },
    {
        accessorKey: "request.uri",
        header: "Uri",
        size: 25,
    },
    {
        accessorKey: "status",
        header: "Status",
        filterVariant: "range",
        size: 25,
    },
    {
        accessorKey: "duration_in_ms",
        header: "Duration (ms)",
        filterVariant: "range",
        size: 25,
    },
    {
        accessorKey: "duration_in_s",
        header: "Duration (s)",
        size: 25,
    },
    {
        accessorKey: "request.client_ip",
        header: "Client IP",
        size: 25,
    },
    {
        accessorKey: "level",
        header: "level",
        size: 25,
    },
    {
        accessorKey: "request_bytes_read",
        header: "Req bytes read",
        filterVariant: "range",
        size: 25,
    },
    {
        accessorKey: "response_size",
        header: "Res size",
        filterVariant: "range",
        size: 25,
    },
    {
        accessorKey: "msg",
        header: "Message",
        size: 25,
    },
    {
        accessorKey: "logger",
        header: "Logger",
        size: 25,
    },
];

export const CaddyTableTab = observer<{ caddyLogsStore: CaddyLogsStore }>(({ caddyLogsStore }) => {
    const table = useMaterialReactTable({
        columns,
        data: caddyLogsStore.data,
        state: { isLoading: caddyLogsStore.loadingState.isLoading },
        muiTablePaperProps: { id: "caddy-table" },
    });

    return <MaterialReactTable table={table} />;
});
