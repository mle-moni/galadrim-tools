import { Box, Paper, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { observer } from "mobx-react-lite";
import { LineChart, PieChart } from "react-chartkick";
import type { CaddyLogsStore } from "./CaddyLogsStore";

export const CaddyGraphTab = observer<{ caddyLogsStore: CaddyLogsStore }>(({ caddyLogsStore }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, my: 2 }}>
                    <DateTimePicker
                        label="Start date filter"
                        value={caddyLogsStore.start}
                        onChange={(d) => caddyLogsStore.setStart(d)}
                    />
                    <DateTimePicker
                        label="End date filter"
                        value={caddyLogsStore.end}
                        onChange={(d) => caddyLogsStore.setEnd(d)}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        my: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "stretch",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
                        <PieChart
                            data={caddyLogsStore.pieData}
                            colors={caddyLogsStore.pieDataColors}
                            download
                        />
                        <Typography style={{ textAlign: "center" }}>HTTP codes</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
                        <PieChart data={caddyLogsStore.uriResponseTime} download />
                        <Typography style={{ textAlign: "center" }}>
                            Cumulated response time per URI
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
                        <PieChart data={caddyLogsStore.uniqueIpRequestCount} download />
                        <Typography style={{ textAlign: "center" }}>
                            Request count per Unique IP
                        </Typography>
                    </Box>
                </Box>
                <LineChart
                    data={caddyLogsStore.lineData}
                    download
                    xtitle="Time"
                    ytitle="Requests"
                />
            </Box>
        </Paper>
    );
});
