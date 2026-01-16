import Snowfall from "react-snowfall";

function isInSnowSeason(date: Date): boolean {
    const month = date.getMonth();
    const year = date.getFullYear();

    // Season is Dec 16 .. Feb 16 (inclusive), spanning a year boundary.
    const startYear = month >= 11 ? year : year - 1;
    const start = new Date(startYear, 11, 16, 0, 0, 0, 0);
    const end = new Date(startYear + 1, 1, 16, 23, 59, 59, 999);

    return date >= start && date <= end;
}

type SeasonalSnowfallProps = {
    enabled?: boolean;
};

export default function SeasonalSnowfall({ enabled = true }: SeasonalSnowfallProps) {
    const shouldRender = enabled && isInSnowSeason(new Date());

    if (!shouldRender) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] h-svh w-svw motion-reduce:hidden">
            <div className="relative h-full w-full">
                <Snowfall color="#e0e0e0" snowflakeCount={200} />
            </div>
        </div>
    );
}
