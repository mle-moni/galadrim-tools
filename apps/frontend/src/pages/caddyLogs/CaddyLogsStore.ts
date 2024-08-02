import { format } from "date-fns";
import { makeAutoObservable } from "mobx";
import { type HTTPMethod, fetchBackendJson, getErrorMessage } from "../../api/fetch";
import { LoadingStateStore } from "../../reusableComponents/form/LoadingStateStore";
import { notifyError } from "../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../idea/createIdea/CreateIdeaStore";

const FIVE_MIN_IN_MS = 5 * 60 * 1000;

export interface CaddyLog {
    level: "info" | "error";
    ts: string;
    logger: string;
    msg: string;
    request: {
        client_ip: string;
        method: HTTPMethod;
        host: string;
        uri: string;
    };
    request_bytes_read: number;
    user_id: string;
    duration_in_s: number;
    duration_in_ms: number;
    response_size: number;
    status: number;
}

export class CaddyLogsStore {
    originalData: CaddyLog[] = [];

    start: Date | null = null;
    end: Date | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    loadingState = new LoadingStateStore();

    async fetch(fileName: string) {
        this.loadingState.setIsLoading(true);
        const res = await fetchBackendJson<CaddyLog[], unknown>(`/caddyLogs/${fileName}`, "GET", {
            headers: APPLICATION_JSON_HEADERS,
        });
        this.loadingState.setIsLoading(false);

        if (!res.ok) {
            notifyError(getErrorMessage(res.json, "Erreur lors de la récupération des logs"));
            return;
        }

        this.setLogs(res.json);
    }

    setLogs(newData: CaddyLog[]) {
        this.originalData = newData;
    }

    get data() {
        return this.originalData.map((l) => ({
            ...l,
            duration_in_ms: Math.round(l.duration_in_s * 1000),
            ts: format(new Date(l.ts), "dd/MM/yyyy HH:mm:ss"),
        }));
    }

    setStart(date: Date | null) {
        this.start = date;
    }

    setEnd(date: Date | null) {
        this.end = date;
    }

    get filteredData() {
        return this.originalData.filter((l) => {
            const logDate = new Date(l.ts);

            if (l.request.uri.startsWith("/assets")) return false;
            if (this.start && logDate < this.start) return false;
            if (this.end && logDate > this.end) return false;

            return true;
        });
    }

    get pieDataColors() {
        return ["#339900", "#99cc33", "#ffcc00", "#cc3300"];
    }

    get pieData() {
        const http200: ChartDataRow = ["200", 0];
        const http300: ChartDataRow = ["300", 0];
        const http400: ChartDataRow = ["400", 0];
        const http500: ChartDataRow = ["500", 0];

        this.filteredData.forEach((log) => {
            const status = log.status.toString();
            if (status.startsWith("2")) {
                http200[1]++;
            } else if (status.startsWith("3")) {
                http300[1]++;
            } else if (status.startsWith("4")) {
                http400[1]++;
            } else if (status.startsWith("5")) {
                http500[1]++;
            }
        });

        const data: ChartRowData = [http200, http300, http400, http500];

        return data;
    }

    get lineData() {
        if (this.filteredData.length === 0) return [];
        const firstDate = new Date(this.filteredData[0].ts);
        const lastDate = new Date(this.filteredData[this.filteredData.length - 1].ts);
        const minutesMap = getMinutesMap(firstDate, lastDate);

        // add data to the array if data.ts is in the 5min span
        for (const log of this.filteredData) {
            const logDate = new Date(log.ts);
            const logDateMs = logDate.getTime();
            const normalizedLogDateMs = logDateMs - (logDateMs % FIVE_MIN_IN_MS);
            const found = minutesMap.get(normalizedLogDateMs);

            if (found) {
                minutesMap.set(normalizedLogDateMs, found + 1);
            } else {
                minutesMap.set(normalizedLogDateMs, 1);
            }
        }

        const data = Array.from(minutesMap).map(
            ([key, value]) => [new Date(key).toISOString(), value] as [string, number],
        );

        return data;
    }

    get uriResponseTime() {
        const map = new Map<string, number>();

        this.filteredData.forEach((log) => {
            const uri = log.request.uri.split("?")[0];
            const duration = Math.round(log.duration_in_s * 1000);
            const found = map.get(uri);

            if (found) {
                map.set(uri, found + duration);
            } else {
                map.set(uri, duration);
            }
        });

        const data: ChartRowData = Array.from(map)
            .map(([key, value]) => [key, value] as [string, number])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        return data;
    }

    get uniqueIpRequestCount() {
        const map = new Map<string, number>();

        this.filteredData.forEach((log) => {
            const clientIp = log.request.client_ip;
            const found = map.get(clientIp);

            if (found) {
                map.set(clientIp, found + 1);
            } else {
                map.set(clientIp, 1);
            }
        });

        const data: ChartRowData = Array.from(map)
            .map(([key, value]) => [key, value] as [string, number])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        return data;
    }
}

const getMinutesMap = (firstDate: Date, lastDate: Date) => {
    const firstDateMs = firstDate.getTime();
    const lastDateMs = lastDate.getTime();
    const minutesMap: Map<number, number> = new Map();
    const normalizedFirstDateMs = firstDateMs - (firstDateMs % FIVE_MIN_IN_MS);

    for (let i = normalizedFirstDateMs; i < lastDateMs; i += FIVE_MIN_IN_MS) {
        minutesMap.set(i, 0);
    }

    return minutesMap;
};
