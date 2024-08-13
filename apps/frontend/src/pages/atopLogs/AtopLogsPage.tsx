import "chartkick/chart.js";

import { Box, Tab, Tabs, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { LineChart } from "react-chartkick";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { AtopLogsStore } from "./AtopLogsStore";

const ATOP_TABS = [
    { label: "Memory", value: 0 },
    { label: "Cpu", value: 1 },
    { label: "Disk", value: 2 },
    { label: "Network", value: 3 },
] as const;

type AtopTabValue = (typeof ATOP_TABS)[number]["value"];

export const AtopLogsPage = observer(() => {
    const [tab, setTab] = useState<AtopTabValue>(0);
    const atopLogsStore = useMemo(() => new AtopLogsStore(), []);
    const { id } = useParams();
    const isMobile = useIsMobile();

    useEffect(() => {
        atopLogsStore.fetch(id ?? "NOT_FOUND");
    }, [id, atopLogsStore]);

    return (
        <MainLayout fullscreen>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        px: 2,
                        minHeight: "100vh",
                    }}
                >
                    <Typography sx={{ fontSize: 26, textAlign: "center", m: 2 }}>
                        Logs Atop
                    </Typography>
                    <Tabs
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        value={tab}
                        onChange={(_event, tab) => setTab(tab)}
                        scrollButtons={false}
                        sx={{ my: 2, mx: "auto" }}
                    >
                        {ATOP_TABS.map(({ label, value }) => (
                            <Tab key={value} label={label} />
                        ))}
                    </Tabs>

                    <Box sx={{ display: "flex", gap: 2, my: 2, justifyContent: "center" }}>
                        <DateTimePicker
                            label="Start date filter"
                            value={atopLogsStore.start}
                            onChange={(d) => atopLogsStore.setStart(d)}
                        />
                        <DateTimePicker
                            label="End date filter"
                            value={atopLogsStore.end}
                            onChange={(d) => atopLogsStore.setEnd(d)}
                        />
                    </Box>

                    <Box sx={{ minHeight: "40vh" }}>
                        {tab === 0 && (
                            <LineChart
                                data={atopLogsStore.memoryData}
                                download
                                ytitle="Memory used (%)"
                                max={100}
                                min={0}
                            />
                        )}
                        {tab === 1 && (
                            <LineChart
                                data={atopLogsStore.cpuData}
                                download
                                ytitle="Cpu usage (%)"
                                max={100}
                                min={0}
                            />
                        )}
                        {tab === 2 && (
                            <>
                                <LineChart
                                    data={atopLogsStore.ioTimeDiskData}
                                    download
                                    ytitle="I/O Time (ms)"
                                />
                                <LineChart
                                    data={atopLogsStore.readWriteDiskData}
                                    download
                                    ytitle="Read/Write Operations"
                                />
                            </>
                        )}
                        {tab === 3 && (
                            <>
                                <LineChart
                                    data={atopLogsStore.inOutNetworkData}
                                    download
                                    ytitle="Network in/out (bytes)"
                                />
                                <LineChart
                                    data={atopLogsStore.networkErrorsData}
                                    download
                                    ytitle="Network in/out errors"
                                />
                            </>
                        )}
                    </Box>
                </Box>
            </LocalizationProvider>
        </MainLayout>
    );
});

export default AtopLogsPage;
