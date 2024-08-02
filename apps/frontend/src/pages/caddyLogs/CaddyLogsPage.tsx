import "chartkick/chart.js";

import { Box, Tab, Tabs, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { CaddyGraphTab } from "./CaddyGraphTab";
import { CaddyLogsStore } from "./CaddyLogsStore";
import { CaddyTableTab } from "./CaddyTableTab";

const CADDY_TABS = [
    { label: "Table", value: 0 },
    { label: "Graphs", value: 1 },
] as const;

type CaddyTabValue = (typeof CADDY_TABS)[number]["value"];

export const CaddyLogsPage = observer(() => {
    const [tab, setTab] = useState<CaddyTabValue>(0);
    const caddyLogsStore = useMemo(() => new CaddyLogsStore(), []);
    const { id } = useParams();
    const isMobile = useIsMobile();

    useEffect(() => {
        caddyLogsStore.fetch(id ?? "NOT_FOUND");
    }, [id, caddyLogsStore]);

    return (
        <MainLayout fullscreen>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        px: 2,
                    }}
                >
                    <Typography sx={{ fontSize: 26, textAlign: "center", m: 2 }}>
                        Logs Caddy
                    </Typography>
                    <Tabs
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        value={tab}
                        onChange={(_event, tab) => setTab(tab)}
                        scrollButtons={false}
                        sx={{ my: 2, mx: "auto" }}
                    >
                        {CADDY_TABS.map(({ label, value }) => (
                            <Tab key={value} label={label} />
                        ))}
                    </Tabs>

                    {tab === 0 && <CaddyTableTab caddyLogsStore={caddyLogsStore} />}
                    {tab === 1 && <CaddyGraphTab caddyLogsStore={caddyLogsStore} />}
                </Box>
            </LocalizationProvider>
        </MainLayout>
    );
});

export default CaddyLogsPage;
