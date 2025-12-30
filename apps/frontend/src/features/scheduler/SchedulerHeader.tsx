import type React from "react";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useClock } from "@/debug/clock";

interface SchedulerHeaderProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;

    isFiveMinuteSlots: boolean;
    setIsFiveMinuteSlots: (val: boolean) => void;

    showOnlyFreeRooms: boolean;
    setShowOnlyFreeRooms: (val: boolean) => void;

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
    showOnlyFreeRooms,
    setShowOnlyFreeRooms,
    leading,
    viewToggle,
    officeSelector,
    floorFilters,
}: SchedulerHeaderProps) {
    const clock = useClock();

    const formatDate = (date: Date) => {
        return format(date, "EEEE d MMMM", { locale: fr });
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
        onDateChange(clock.now());
    };

    return (
        <header className="sticky top-0 z-20 w-full max-w-full flex flex-col gap-3 border-b bg-background px-4 py-3 md:gap-4 md:px-6 md:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {leading}
                    <PageTitle icon={CalendarDays}>Salles de réunions</PageTitle>
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

                    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                        <Switch
                            id="only-free-rooms"
                            checked={showOnlyFreeRooms}
                            onCheckedChange={setShowOnlyFreeRooms}
                        />
                        <Label htmlFor="only-free-rooms" className="text-sm">
                            Salles libres maintenant
                        </Label>
                    </div>

                    {viewToggle}
                    {officeSelector}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="min-w-0">{floorFilters}</div>

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
