import { END_HOUR } from "./constants";
import { formatTime } from "./utils";

export default function SchedulerTimeColumn({
    hourIntervals,
    pixelsPerHour,
    gridHeight,
    shouldShowHalfHour,
    showCurrentLine,
    currentLineTop,
    currentTime,
}: {
    hourIntervals: number[];
    pixelsPerHour: number;
    gridHeight: number;
    shouldShowHalfHour: (hour: number) => boolean;
    showCurrentLine: boolean;
    currentLineTop: number;
    currentTime: Date;
}) {
    return (
        <div className="relative" style={{ height: gridHeight }}>
            {hourIntervals.map((hour) => (
                <div
                    key={hour}
                    className="relative w-full box-border border-b border-border/50"
                    style={{ height: pixelsPerHour }}
                >
                    <span className="absolute top-2 left-0 right-0 text-center font-mono text-xs font-medium text-muted-foreground">
                        {hour.toString().padStart(2, "0")}:00
                    </span>

                    {shouldShowHalfHour(hour) && (
                        <span className="absolute top-[50%] left-0 right-0 -translate-y-1/2 text-center font-mono text-xs font-medium text-muted-foreground">
                            {hour.toString().padStart(2, "0")}:30
                        </span>
                    )}
                </div>
            ))}

            <span className="absolute bottom-2 left-0 right-0 text-center font-mono text-xs font-medium text-muted-foreground">
                {END_HOUR.toString().padStart(2, "0")}:00
            </span>

            {showCurrentLine && (
                <div
                    className="absolute left-0 right-0 z-30 -translate-y-1/2 text-center"
                    style={{ top: currentLineTop }}
                >
                    <span className="rounded-sm bg-background/80 px-1 py-0.5 font-mono text-xs font-bold text-foreground shadow-sm backdrop-blur-[1px]">
                        {formatTime(currentTime)}
                    </span>
                </div>
            )}
        </div>
    );
}
