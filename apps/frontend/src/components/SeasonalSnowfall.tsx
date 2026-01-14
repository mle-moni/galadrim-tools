import { useEffect } from "react";
import { DEFAULT_PHYSICS, Snowfall, SnowfallProvider, useSnowfall } from "@hdcodedev/snowfall";
import type { ReactNode } from "react";
import type { PhysicsConfig } from "@hdcodedev/snowfall";

function isInSnowSeason(date: Date): boolean {
    const month = date.getMonth();
    const year = date.getFullYear();

    // Season is Dec 16 .. Feb 16 (inclusive), spanning a year boundary.
    const startYear = month >= 11 ? year : year - 1;
    const start = new Date(startYear, 11, 16, 0, 0, 0, 0);
    const end = new Date(startYear + 1, 1, 16, 23, 59, 59, 999);

    return date >= start && date <= end;
}

export const customSnowfallPhysics: PhysicsConfig = {
    ...DEFAULT_PHYSICS,
    MAX_FLAKES: 1000,
    FLAKE_SIZE: {
        MIN: 1, // Minimum flake radius
        MAX: 4, // Maximum flake radius
    },
};

type SeasonalSnowfallProps = {
    enabled?: boolean;
    children: ReactNode;
};

function SnowfallContent() {
    const snowfall = useSnowfall();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <only want to run once>
    useEffect(() => {
        snowfall.updatePhysicsConfig(customSnowfallPhysics);
    }, []);

    return (
        <>
            <Snowfall />
            <div
                data-snowfall="top"
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100vw",
                    height: "1px",
                    zIndex: 1000,
                }}
            />
        </>
    );
}

export default function SeasonalSnowfallProvider({
    enabled = true,
    children,
}: SeasonalSnowfallProps) {
    const shouldRender = enabled && isInSnowSeason(new Date());

    if (!shouldRender) {
        return <>{children}</>;
    }

    return (
        <SnowfallProvider>
            <SnowfallContent />
            {children}
        </SnowfallProvider>
    );
}
