import { format } from "date-fns";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import { LoadingStateStore } from "../../reusableComponents/form/LoadingStateStore";
import { notifyError } from "../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../idea/createIdea/CreateIdeaStore";
import type { AtopLog, CpuLog } from "./atop.types";

const FIVE_MIN_IN_MS = 5 * 60 * 1000;

export class AtopLogsStore {
    originalData: AtopLog[] = [];

    start: Date | null = null;
    end: Date | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    loadingState = new LoadingStateStore();

    async fetch(fileName: string) {
        this.loadingState.setIsLoading(true);
        const res = await fetchBackendJson<AtopLog[], unknown>(`/atopLogs/${fileName}`, "GET", {
            headers: APPLICATION_JSON_HEADERS,
        });
        this.loadingState.setIsLoading(false);

        if (!res.ok) {
            notifyError(getErrorMessage(res.json, "Erreur lors de la récupération des logs"));
            return;
        }

        this.setLogs(res.json);
    }

    setLogs(newData: AtopLog[]) {
        this.originalData = newData;
    }

    get data() {
        return this.originalData.map((l) => ({
            ...l,
            realTimestamp: l.timestamp * 1000,
            dateFormatted: format(new Date(l.timestamp * 1000), "dd/MM/yyyy HH:mm:ss"),
        }));
    }

    setStart(date: Date | null) {
        this.start = date;
    }

    setEnd(date: Date | null) {
        this.end = date;
    }

    get filteredData() {
        return this.data.filter((l) => {
            const logDate = new Date(l.realTimestamp);

            if (this.start && logDate < this.start) return false;
            if (this.end && logDate > this.end) return false;

            return true;
        });
    }

    get memoryData(): ChartRowData {
        if (this.filteredData.length === 0) return [];

        const data: [string, number][] = this.filteredData.map((l) => {
            const memUsedInBytes = l.MEM.physmem - l.MEM.freemem;
            const memUsedInPercent = Math.round((memUsedInBytes / l.MEM.physmem) * 100);

            return [l.dateFormatted, memUsedInPercent];
        });

        return data;
    }

    get cpuData(): ChartRowData {
        const data: [string, number][] = this.filteredData.map((l) => {
            const cpuUsagePercentage = calculateCpuUtilization(l.CPU);

            return [l.dateFormatted, cpuUsagePercentage];
        });

        return data;
    }

    get ioTimeDiskData(): ChartRowData {
        const series: ChartMultipleSeriesDataRow[] = [];
        for (const l of this.filteredData) {
            l.DSK.forEach((d, index) => {
                const foundSerie = series.find((s) => s.name === d.dskname);
                const data: [string, number] = [l.dateFormatted, d.io_ms];
                if (foundSerie) {
                    foundSerie.data.push(data);
                } else {
                    series.push({ name: d.dskname, data: [data] });
                }
            });
        }

        return series;
    }

    get readWriteDiskData(): ChartRowData {
        const series: ChartMultipleSeriesDataRow[] = [];
        for (const l of this.filteredData) {
            l.DSK.forEach((d) => {
                const readDiskName = `${d.dskname} (read)`;
                const foundReadSerie = series.find((s) => s.name === readDiskName);
                const readData: [string, number] = [l.dateFormatted, d.nread];
                if (foundReadSerie) {
                    foundReadSerie.data.push(readData);
                } else {
                    series.push({ name: readDiskName, data: [readData] });
                }

                const writeDiskName = `${d.dskname} (write)`;
                const foundWriteSerie = series.find((s) => s.name === writeDiskName);
                const writeData: [string, number] = [l.dateFormatted, d.nwrite];
                if (foundWriteSerie) {
                    foundWriteSerie.data.push(writeData);
                } else {
                    series.push({ name: writeDiskName, data: [writeData] });
                }
            });
        }

        return series;
    }

    get networkErrorsData(): ChartRowData {
        const series: ChartMultipleSeriesDataRow[] = [];
        for (const l of this.filteredData) {
            l.NET.forEach((n) => {
                const inNetworkName = `${n.name} (received)`;
                const foundInSerie = series.find((s) => s.name === inNetworkName);
                const inData: [string, number] = [l.dateFormatted, n.rerrs];
                if (foundInSerie) {
                    foundInSerie.data.push(inData);
                } else {
                    series.push({ name: inNetworkName, data: [inData] });
                }

                const outNetworkName = `${n.name} (sent)`;
                const foundOutSerie = series.find((s) => s.name === outNetworkName);
                const outData: [string, number] = [l.dateFormatted, n.serrs];
                if (foundOutSerie) {
                    foundOutSerie.data.push(outData);
                } else {
                    series.push({ name: outNetworkName, data: [outData] });
                }
            });
        }

        return series;
    }

    get inOutNetworkData(): ChartRowData {
        const series: ChartMultipleSeriesDataRow[] = [];
        for (const l of this.filteredData) {
            l.NET.forEach((n) => {
                const inNetworkName = `${n.name} (received)`;
                const foundInSerie = series.find((s) => s.name === inNetworkName);
                const inData: [string, number] = [l.dateFormatted, n.rbyte];
                if (foundInSerie) {
                    foundInSerie.data.push(inData);
                } else {
                    series.push({ name: inNetworkName, data: [inData] });
                }

                const outNetworkName = `${n.name} (sent)`;
                const foundOutSerie = series.find((s) => s.name === outNetworkName);
                const outData: [string, number] = [l.dateFormatted, n.sbyte];
                if (foundOutSerie) {
                    foundOutSerie.data.push(outData);
                } else {
                    series.push({ name: outNetworkName, data: [outData] });
                }
            });
        }

        return series;
    }
}

const calculateCpuUtilization = (cpuLog: CpuLog) => {
    const { stime, utime, ntime, itime, wtime, Itime, Stime, steal, guest } = cpuLog;

    // Total busy time
    const totalBusyTime = utime + stime + ntime + Itime + Stime + steal + guest;

    // Total time
    const totalTime = totalBusyTime + itime + wtime;

    // CPU utilization
    const cpuUtilization = (totalBusyTime / totalTime) * 100;

    return Math.round(cpuUtilization * 100) / 100;
};
