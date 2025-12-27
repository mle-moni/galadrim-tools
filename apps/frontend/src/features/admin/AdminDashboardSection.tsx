import { useMemo } from "react";
import { formatBytes, formatDuration } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { fetchDashboardInfos } from "@/integrations/backend/admin";
import { queryKeys } from "@/integrations/backend/query-keys";

export default function AdminDashboardSection() {
    const dashboardQuery = useQuery({
        queryKey: queryKeys.adminDashboard(),
        queryFn: fetchDashboardInfos,
        retry: false,
        refetchInterval: 10000,
    });

    const stats = dashboardQuery.data;

    const memoryPercent = useMemo(() => {
        if (!stats?.totalMemory) return 0;
        return Math.min(100, Math.max(0, (stats.memoryUsed / stats.totalMemory) * 100));
    }, [stats?.memoryUsed, stats?.totalMemory]);

    return (
        <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 px-4 py-3">
                    <div className="text-xs text-muted-foreground">Uptime</div>
                    <div className="text-sm font-medium">
                        {stats ? formatDuration(stats.sysUptime) : "—"}
                    </div>
                </div>

                <div className="rounded-lg border border-border/60 px-4 py-3">
                    <div className="text-xs text-muted-foreground">Load average (1/5/15)</div>
                    <div className="text-sm font-medium">
                        {stats
                            ? `${stats.loadAverage1.toFixed(2)} / ${stats.loadAverage5.toFixed(2)} / ${stats.loadAverage15.toFixed(2)}`
                            : "—"}
                    </div>
                </div>

                <div className="sm:col-span-2 rounded-lg border border-border/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground">Mémoire</div>
                            <div className="text-sm font-medium">
                                {stats
                                    ? `${formatBytes(stats.memoryUsed)} / ${formatBytes(stats.totalMemory)}`
                                    : "—"}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {stats ? `${memoryPercent.toFixed(0)}%` : ""}
                        </div>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted/30">
                        <div
                            className="h-full bg-primary transition-[width]"
                            style={{ width: `${memoryPercent}%` }}
                        />
                    </div>
                </div>

                {dashboardQuery.isError && (
                    <div className="sm:col-span-2 text-sm text-muted-foreground">
                        Impossible de charger le dashboard.
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    variant="outline"
                    onClick={() => dashboardQuery.refetch()}
                    disabled={dashboardQuery.isFetching}
                >
                    Rafraîchir
                </Button>
            </CardFooter>
        </Card>
    );
}
