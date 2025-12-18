import type React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SchedulerHeaderProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    isFiveMinuteSlots: boolean;
    setIsFiveMinuteSlots: (val: boolean) => void;
    leading?: React.ReactNode;

    viewToggle?: React.ReactNode;
    officeSelector?: React.ReactNode;
    floorFilters?: React.ReactNode;
}

export default function SchedulerHeader({
    currentDate,
    onDateChange,
    isFiveMinuteSlots,
    setIsFiveMinuteSlots,
    leading,
    viewToggle,
    officeSelector,
    floorFilters,
}: SchedulerHeaderProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    return (
        <header className="sticky top-0 z-20 w-full max-w-full flex flex-col gap-4 border-b bg-background px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {leading}
                    <h1 className="truncate text-xl font-semibold tracking-tight">
                        Salles de réunions
                    </h1>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                        <Switch
                            id="five-minute-slots"
                            checked={isFiveMinuteSlots}
                            onCheckedChange={setIsFiveMinuteSlots}
                        />
                        <Label htmlFor="five-minute-slots" className="text-sm">
                            Slots de 5 minutes
                        </Label>
                    </div>

                    {viewToggle}
                    {officeSelector}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap items-center gap-1">{floorFilters}</div>

                <div className="min-w-0 flex-1 text-center text-base font-semibold capitalize text-foreground">
                    {formatDate(currentDate)}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1">
                        <Button variant="ghost" size="sm" onClick={handleToday}>
                            Aujourd'hui
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handlePrevDay}>
                            Précédent
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleNextDay}>
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
