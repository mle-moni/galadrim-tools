import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useDebug } from "./DebugProvider";
import { useClock } from "./clock";
import { parseDebugNow } from "./time";

export default function DebugDevtoolsPanel() {
    const debug = useDebug();
    const clock = useClock();

    const parsedDraft = useMemo(() => {
        if (!debug.nowDraft.trim()) return null;
        return parseDebugNow(debug.nowDraft, new Date());
    }, [debug.nowDraft]);

    const parsedActive = useMemo(() => {
        if (!debug.enabled || !debug.nowRaw) return null;
        return parseDebugNow(debug.nowRaw, new Date());
    }, [debug.enabled, debug.nowRaw]);

    if (!debug.canSpoof) {
        return (
            <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Debug</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                    Debug spoofing is only enabled on localhost.
                </div>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">Spoof time</div>
                    <div className="text-xs text-muted-foreground">
                        {parsedActive
                            ? `Active: ${parsedActive.toISOString()}`
                            : `Active: real time (${clock.nowIso()})`}
                    </div>
                </div>
                <Switch checked={debug.enabled} onCheckedChange={debug.setEnabled} />
            </div>

            <div className="mt-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="debug-now" className="text-xs">
                        Fake current time
                    </Label>
                    <Input
                        id="debug-now"
                        value={debug.nowDraft}
                        onChange={(e) => debug.setNowDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && parsedDraft) debug.applyNowDraft();
                        }}
                        placeholder="14:30 | 2025-12-23T14:30"
                    />

                    {debug.nowDraft.trim().length > 0 && !parsedDraft && (
                        <div className="text-xs text-destructive">
                            Invalid format. Use <span className="font-mono">HH:MM</span> or an ISO
                            date.
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        onClick={debug.applyNowDraft}
                        disabled={!parsedDraft}
                    >
                        Apply
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={debug.clearNow}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
